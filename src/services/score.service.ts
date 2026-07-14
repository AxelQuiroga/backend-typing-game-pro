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

  // Compute each entry's global rank
  const entries = await Promise.all(
    scores.map(async (score) => ({
      ...score,
      rank: await getPlayerRank(score.score),
    })),
  );

  return entries;
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
 */
export async function getPlayerStats(nickname: string): Promise<PlayerStats | null> {
  const scores = await prisma.score.findMany({
    where: { nickname },
    orderBy: { createdAt: 'asc' },
  });

  if (scores.length === 0) return null;

  const totalGames = scores.length;
  const bestScore = Math.max(...scores.map((s) => s.score));
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalGames);
  const bestLevel = Math.max(...scores.map((s) => s.level));
  const avgAccuracy =
    Math.round(
      (scores.reduce((sum, s) => sum + s.accuracy, 0) / totalGames) * 100,
    ) / 100;
  const totalWordsCompleted = scores.reduce((sum, s) => sum + s.wordsCompleted, 0);
  const totalCorrectLetters = scores.reduce((sum, s) => sum + s.correctLetters, 0);
  const totalLettersTyped = scores.reduce((sum, s) => sum + s.totalLetters, 0);

  // Last 20 scores for chart
  const recent = scores.slice(-20);
  const scoreHistory = recent.map((s) => ({
    score: s.score,
    accuracy: s.accuracy,
    level: s.level,
    date: s.createdAt.toISOString(),
  }));

  return {
    nickname,
    totalGames,
    bestScore,
    avgScore,
    bestLevel,
    avgAccuracy,
    totalWordsCompleted,
    totalCorrectLetters,
    totalLettersTyped,
    scoreHistory,
  };
}
