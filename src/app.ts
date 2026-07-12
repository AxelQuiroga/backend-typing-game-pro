import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import scoresRouter from './routes/scores.routes';

// ═══════════════════════════════════════════════════════════
// Express Application — Composition Root
//
// Where we wire ALL dependencies together:
// middleware → routes → controllers → services → database.
//
// This file knows about infrastructure. The routes/controllers
// do NOT know about Express, CORS, or env vars.
// ═══════════════════════════════════════════════════════════

const app = express();

// ── Global Middleware ──
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10kb' })); // Limit body size — security

// ── Health Check ──
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ── Routes ──
app.use('/api/scores', scoresRouter);

// ── 404 Handler ──
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// ── Global Error Handler ──
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Uncaught Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;
