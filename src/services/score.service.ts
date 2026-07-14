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
