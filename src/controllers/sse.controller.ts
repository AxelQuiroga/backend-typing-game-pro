// ═══════════════════════════════════════════════════════════
// SSE Controller — Code Typist Arcade
// ═══════════════════════════════════════════════════════════

import type { Request, Response } from 'express';
import * as SSEService from '../services/sse.service';

/**
 * GET /api/sse/stream
 * Establish an SSE connection for real-time updates.
 * Optional query: ?nickname=xxx to track who's connected.
 */
export function stream(req: Request, res: Response): void {
  const nickname = req.query.nickname as string | undefined;
  SSEService.addClient(res, nickname);
}

/**
 * GET /api/sse/health
 * Check SSE connection status.
 */
export function health(_req: Request, res: Response): void {
  res.json({
    success: true,
    clients: SSEService.getClientCount(),
  });
}
