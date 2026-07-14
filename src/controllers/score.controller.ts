import type { Request, Response } from 'express';
import * as ScoreService from '../services/score.service';
import { getBody, getQuery, getParams } from '../middleware/types';
import type {
  CreateScoreInput,
  GetScoresQuery,
  PlayerParams,
  PlayerHistoryQuery,
  RankParams,
} from '../dtos/score.dto';

// ═══════════════════════════════════════════════════════════
// ScoreController — HTTP handler layer
//
// DOES ONE THING: maps HTTP ↔ service calls.
// - Reads validated data via getBody<T> / getQuery<T> / getParams<T>
// - Calls service
// - Sends response
//
// NO validation. NO try/catch. NO business logic.
// Express 5 handles async errors natively.
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/scores
 */
export async function createScore(req: Request, res: Response): Promise<void> {
  const input = getBody<CreateScoreInput>(req);
  const { record, rank } = await ScoreService.createScore(input);

  res.status(201).json({
    success: true,
    rank,
    message: 'Score recorded',
    data: {
      id: record.id,
      nickname: record.nickname,
      score: record.score,
      level: record.level,
    },
  });
}

/**
 * GET /api/scores
 */
export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  const { limit } = getQuery<GetScoresQuery>(req);
  const scores = await ScoreService.getLeaderboard(limit);

  res.json({
    success: true,
    data: scores,
  });
}

/**
 * GET /api/scores/player/:nickname
 */
export async function getPlayerScores(req: Request, res: Response): Promise<void> {
  const { nickname } = getParams<PlayerParams>(req);
  const { limit } = getQuery<PlayerHistoryQuery>(req);
  const scores = await ScoreService.getPlayerScores(nickname, limit);

  res.json({
    success: true,
    data: scores,
  });
}

/**
 * GET /api/scores/rank/:score
 */
export async function getPlayerRank(req: Request, res: Response): Promise<void> {
  const { score } = getParams<RankParams>(req);
  const rank = await ScoreService.getPlayerRank(score);

  res.json({
    success: true,
    rank,
  });
}
