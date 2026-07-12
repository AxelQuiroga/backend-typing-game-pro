import { Router } from 'express';
import * as ScoreController from '../controllers/score.controller';

// ═══════════════════════════════════════════════════════════
// Score Routes — Endpoint Definitions
//
// Maps HTTP verbs + paths to controller functions.
// Thin layer — no logic here beyond routing.
// ═══════════════════════════════════════════════════════════

const router = Router();

router.get('/', ScoreController.getLeaderboard);
router.post('/', ScoreController.createScore);

export default router;
