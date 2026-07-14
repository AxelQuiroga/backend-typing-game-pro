import { Router } from 'express';
import * as ScoreController from '../controllers/score.controller';
import { validate } from '../middleware/validate';
import { scoreSubmitLimiter } from '../middleware/rateLimit';
import {
  CreateScoreSchema,
  GetScoresQuerySchema,
  PlayerParamsSchema,
  PlayerHistoryQuerySchema,
  RankParamsSchema,
  StatsParamsSchema,
} from '../dtos/score.dto';

// ═══════════════════════════════════════════════════════════
// Score Routes
//
// Validation middleware runs BEFORE the controller.
// By the time the handler executes, req.body / req.query / req.params
// is already validated and typed. The controller never sees
// raw, unvalidated input.
// ═══════════════════════════════════════════════════════════

const router = Router();

// ── Leaderboard ──
router.get(
  '/',
  validate(GetScoresQuerySchema, 'query'),
  ScoreController.getLeaderboard,
);

// ── Player scores ──
router.get(
  '/player/:nickname',
  validate(PlayerParamsSchema, 'params'),
  validate(PlayerHistoryQuerySchema, 'query'),
  ScoreController.getPlayerScores,
);

// ── Rank lookup ──
router.get(
  '/rank/:score',
  validate(RankParamsSchema, 'params'),
  ScoreController.getPlayerRank,
);

// ── Player stats ──
router.get(
  '/stats/:nickname',
  validate(StatsParamsSchema, 'params'),
  ScoreController.getPlayerStats,
);

// ── Submit score ──
router.post(
  '/',
  scoreSubmitLimiter,
  validate(CreateScoreSchema, 'body'),
  ScoreController.createScore,
);

export default router;
