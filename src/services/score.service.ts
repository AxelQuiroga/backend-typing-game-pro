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
  accuracy: number;
  createdAt: Date;
}

export interface LeaderboardEntry extends ScoreRecord {
  rank: number;
}

/**
 * Create a new score record.
 * Returns the created score with its global rank.
 */
export async function createScore(
  input: CreateScoreInput,
): Promise<{ record: ScoreRecord; rank: number }> {
  // Calculate accuracy: wordsCompleted / level * 10 (heuristic)
  // If frontend provides accuracy later, we can use that instead.
  const accuracy =
    input.wordsCompleted > 0
      ? Math.min(100, (input.wordsCompleted / (input.level * 5)) * 100)
      : 0;

  const record = await prisma.score.create({
    data: {
      nickname: input.nickname,
      score: input.score,
      level: input.level,
      wordsCompleted: input.wordsCompleted,
      accuracy: Math.round(accuracy * 100) / 100, // 2 decimal places
    },
  });

  // Compute rank: count how many scores are higher
  const higherCount = await prisma.score.count({
    where: { score: { gt: record.score } },
  });

  return {
    record,
    rank: higherCount + 1,
  };
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
