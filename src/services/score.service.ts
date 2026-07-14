import { prisma } from '../config/db';
import type { CreateScoreInput } from '../dtos/score.dto';

// ═══════════════════════════════════════════════════════════
// ScoreService — Business Logic Layer
//
// Knows NOTHING about HTTP, Express, or request/response.
// Pure business logic that could be called from a CLI, a queue,
// or a WebSocket handler. THAT is what Clean Architecture means.
// ═══════════════════════════════════════════════════════════

export interface ScoreRecord {
  id: number;
  nickname: string;
  score: number;
  level: number;
  wordsCompleted: number;
  correctLetters: number;
  totalLetters: number;
  accuracy: number;
  maxCombo: number;
  createdAt: Date;
}

export interface LeaderboardEntry extends ScoreRecord {
  rank: number;
}

/**
 * Compute the global rank for a given score.
 * Counts how many scores are strictly higher + 1.
 */
export async function getPlayerRank(score: number): Promise<number> {
  const higherCount = await prisma.score.count({
    where: { score: { gt: score } },
  });
  return higherCount + 1;
}

/**
 * Create a new score record.
 * Returns the created score with its global rank.
 */
export async function createScore(
  input: CreateScoreInput,
): Promise<{ record: ScoreRecord; rank: number }> {
  // Calculate real accuracy from letter tracking
  const accuracy =
    input.totalLetters > 0
      ? Math.round((input.correctLetters / input.totalLetters) * 10000) / 100
      : 0;

  const record = await prisma.score.create({
    data: {
      nickname: input.nickname,
      score: input.score,
      level: input.level,
      wordsCompleted: input.wordsCompleted,
      correctLetters: input.correctLetters,
      totalLetters: input.totalLetters,
      maxCombo: input.maxCombo,
      accuracy,
    },
  });

  const rank = await getPlayerRank(record.score);

  return { record, rank };
}

/**
 * Get the top N scores for the leaderboard.
 */
export async function getLeaderboard(
  limit: number = 10,
): Promise<LeaderboardEntry[]> {
  const scores = await prisma.score.findMany({
    orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    take: limit,
  });

  return scores.map((score, index) => ({
    ...score,
    rank: index + 1,
  }));
}

/**
 * Get a player's score history, ordered by best score first.
 * Uses batch rank computation to avoid N+1 queries.
 */
export async function getPlayerScores(
  nickname: string,
  limit: number = 20,
): Promise<LeaderboardEntry[]> {
  const scores = await prisma.score.findMany({
    where: { nickname },
    orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    take: limit,
  });

  if (scores.length === 0) return [];

  // Batch rank: get distinct score values and count higher scores for each
  const distinctScores = [...new Set(scores.map((s) => s.score))];
  
  // Single query to count how many scores are higher than each distinct value
  const rankCounts = await Promise.all(
    distinctScores.map(async (scoreValue) => {
      const higherCount = await prisma.score.count({
        where: { score: { gt: scoreValue } },
      });
      return { score: scoreValue, rank: higherCount + 1 };
    }),
  );

  // Build a lookup map: score value → rank
  const rankMap = new Map(rankCounts.map((r) => [r.score, r.rank]));

  return scores.map((score) => ({
    ...score,
    rank: rankMap.get(score.score) ?? 0,
  }));
}

/**
 * Get a player's best score.
 */
export async function getPlayerBest(
  nickname: string,
): Promise<ScoreRecord | null> {
  return prisma.score.findFirst({
    where: { nickname },
    orderBy: { score: 'desc' },
  });
}

export interface PlayerStats {
  nickname: string;
  totalGames: number;
  bestScore: number;
  avgScore: number;
  bestLevel: number;
  avgAccuracy: number;
  totalWordsCompleted: number;
  totalCorrectLetters: number;
  totalLettersTyped: number;
  /** Last 20 scores for the chart, ordered by date */
  scoreHistory: Array<{ score: number; accuracy: number; level: number; date: string }>;
}

/**
 * Get aggregated stats for a player.
 * Uses Prisma aggregate instead of loading all records into memory.
 */
export async function getPlayerStats(nickname: string): Promise<PlayerStats | null> {
  // Single aggregate query for all stats
  const aggregate = await prisma.score.aggregate({
    where: { nickname },
    _count: true,
    _sum: {
      wordsCompleted: true,
      correctLetters: true,
      totalLetters: true,
    },
    _avg: {
      score: true,
      accuracy: true,
    },
    _max: {
      score: true,
      level: true,
    },
  });

  if (aggregate._count === 0) return null;

  // Last 20 scores for chart (separate query, limited)
  const recentScores = await prisma.score.findMany({
    where: { nickname },
    orderBy: { createdAt: 'asc' },
    take: 20,
    skip: Math.max(0, aggregate._count - 20), // skip to last 20
    select: {
      score: true,
      accuracy: true,
      level: true,
      createdAt: true,
    },
  });

  return {
    nickname,
    totalGames: aggregate._count,
    bestScore: aggregate._max.score ?? 0,
    avgScore: Math.round(aggregate._avg.score ?? 0),
    bestLevel: aggregate._max.level ?? 0,
    avgAccuracy: Math.round((aggregate._avg.accuracy ?? 0) * 100) / 100,
    totalWordsCompleted: aggregate._sum.wordsCompleted ?? 0,
    totalCorrectLetters: aggregate._sum.correctLetters ?? 0,
    totalLettersTyped: aggregate._sum.totalLetters ?? 0,
    scoreHistory: recentScores.map((s) => ({
      score: s.score,
      accuracy: s.accuracy,
      level: s.level,
      date: s.createdAt.toISOString(),
    })),
  };
}
