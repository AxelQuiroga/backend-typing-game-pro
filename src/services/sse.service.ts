// ═══════════════════════════════════════════════════════════
// SSE Service — Code Typist Arcade
//
// Manages Server-Sent Events connections for real-time
// leaderboard updates. When a new score arrives, all
// connected clients get notified instantly.
// ═══════════════════════════════════════════════════════════

import type { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
  nickname?: string;
}

let clientIdCounter = 0;
const clients = new Map<string, SSEClient>();

/**
 * Register a new SSE client connection.
 */
export function addClient(res: Response, nickname?: string): string {
  const id = `client-${++clientIdCounter}`;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ id })}\n\n`);

  clients.set(id, { id, res, nickname });

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(':heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      removeClient(id);
    }
  }, 30_000);

  // Cleanup on disconnect
  res.on('close', () => {
    clearInterval(heartbeat);
    removeClient(id);
  });

  return id;
}

/**
 * Remove a client connection.
 */
export function removeClient(id: string): void {
  const client = clients.get(id);
  if (client) {
    try {
      client.res.end();
    } catch {
      // Already closed
    }
    clients.delete(id);
  }
}

/**
 * Broadcast a new score to all connected clients.
 */
export function broadcastScore(score: {
  nickname: string;
  score: number;
  level: number;
  rank: number;
  accuracy: number;
}): void {
  const data = JSON.stringify(score);
  for (const [_id, client] of clients) {
    try {
      client.res.write(`event: score\ndata: ${data}\n\n`);
    } catch {
      // Client disconnected — will be cleaned up by 'close' handler
    }
  }
}

/**
 * Broadcast an achievement unlock to all connected clients.
 */
export function broadcastAchievement(achievement: {
  nickname: string;
  key: string;
  name: string;
  icon: string;
}): void {
  const data = JSON.stringify(achievement);
  for (const [_id, client] of clients) {
    try {
      client.res.write(`event: achievement\ndata: ${data}\n\n`);
    } catch {
      // Client disconnected
    }
  }
}

/**
 * Get the number of connected clients.
 */
export function getClientCount(): number {
  return clients.size;
}
