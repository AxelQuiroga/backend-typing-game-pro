import { Router } from 'express';
import * as ScoreController from '../controllers/score.controller';
import { validate } from '../middleware/validate';
import {
  CreateScoreSchema,
  GetScoresQuerySchema,
  PlayerParamsSchema,
  PlayerHistoryQuerySchema,
  RankParamsSchema,
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

// ── Submit score ──
router.post(
  '/',
  validate(CreateScoreSchema, 'body'),
  ScoreController.createScore,
);

export default router;
