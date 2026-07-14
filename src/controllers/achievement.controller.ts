// ═══════════════════════════════════════════════════════════
// AchievementController — Code Typist Arcade
// ═══════════════════════════════════════════════════════════

import type { Request, Response } from 'express';
import * as AchievementService from '../achievements/service';
import { getParams, getBody } from '../middleware/types';
import type { AchievementsCheckInput } from '../dtos/score.dto';

interface PlayerParams {
  nickname: string;
}

/**
 * GET /api/achievements/player/:nickname
 * Get all unlocked achievements for a player.
 */
export async function getPlayerAchievements(req: Request, res: Response): Promise<void> {
  const { nickname } = getParams<PlayerParams>(req);

  const achievements = await AchievementService.getPlayerAchievements(nickname);

  res.json({
    success: true,
    data: achievements,
    count: achievements.length,
  });
}

/**
 * GET /api/achievements/progress/:nickname
 * Get all achievements with unlock status for a player.
 */
export async function getAchievementProgress(req: Request, res: Response): Promise<void> {
  const { nickname } = getParams<PlayerParams>(req);

  const progress = await AchievementService.getAchievementProgress(nickname);
  const unlockedCount = progress.filter((p) => p.unlocked).length;

  res.json({
    success: true,
    data: progress,
    total: progress.length,
    unlocked: unlockedCount,
  });
}

/**
 * POST /api/achievements/check/:nickname
 * Check a score payload against all achievements (called after score submit).
 */
export async function checkAchievements(req: Request, res: Response): Promise<void> {
  const { nickname } = getParams<PlayerParams>(req);
  const scoreInput = getBody<AchievementsCheckInput>(req);

  const newlyUnlocked = await AchievementService.checkAndUnlock(nickname, scoreInput);

  res.json({
    success: true,
    data: newlyUnlocked,
    count: newlyUnlocked.length,
  });
}
