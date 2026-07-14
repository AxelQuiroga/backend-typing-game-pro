// ═══════════════════════════════════════════════════════════
// Achievement Routes — Code Typist Arcade
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import * as AchievementController from '../controllers/achievement.controller';

const router = Router();

const PlayerParamsSchema = z.object({
  nickname: z.string().trim().min(2).max(30).regex(/^[a-zA-Z0-9_-]+$/),
});

// ── Player's unlocked achievements ──
router.get(
  '/player/:nickname',
  validate(PlayerParamsSchema, 'params'),
  AchievementController.getPlayerAchievements,
);

// ── All achievements with unlock status ──
router.get(
  '/progress/:nickname',
  validate(PlayerParamsSchema, 'params'),
  AchievementController.getAchievementProgress,
);

// ── Check achievements against a score ──
router.post(
  '/check/:nickname',
  validate(PlayerParamsSchema, 'params'),
  AchievementController.checkAchievements,
);

export default router;
