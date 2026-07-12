import type { Request, Response } from 'express';
import {
  CreateScoreSchema,
  GetScoresQuerySchema,
} from '../dtos/score.dto';
import * as ScoreService from '../services/score.service';

// ═══════════════════════════════════════════════════════════
// ScoreController — HTTP Layer
//
// Handles ONLY HTTP concerns:
// - Extract data from req
// - Validate via DTOs
// - Call service
// - Format response
//
// Contains ZERO business logic.
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/scores — Submit a new score
 */
export async function createScore(req: Request, res: Response): Promise<void> {
  const parsed = CreateScoreSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  try {
    const { record, rank } = await ScoreService.createScore(parsed.data);

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
  } catch (error) {
    console.error('[Controller] Error creating score:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * GET /api/scores — Get leaderboard
 */
export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  const parsed = GetScoresQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  try {
    const scores = await ScoreService.getLeaderboard(parsed.data.limit);

    res.json({
      success: true,
      data: scores,
    });
  } catch (error) {
    console.error('[Controller] Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
