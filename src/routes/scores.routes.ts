import { Router } from 'express';
import * as ScoreController from '../controllers/score.controller';
import { validate } from '../middleware/validate';
import { CreateScoreSchema, GetScoresQuerySchema } from '../dtos/score.dto';

// ═══════════════════════════════════════════════════════════
// Score Routes
//
// Validation middleware runs BEFORE the controller.
// By the time the handler executes, req.body / req.query
// is already validated and typed. The controller never sees
// raw, unvalidated input.
// ═══════════════════════════════════════════════════════════

const router = Router();

router.get(
  '/',
  validate(GetScoresQuerySchema, 'query'),
  ScoreController.getLeaderboard,
);

router.post(
  '/',
  validate(CreateScoreSchema, 'body'),
  ScoreController.createScore,
);

export default router;
