import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { globalLimiter } from './middleware/rateLimit';
import scoresRouter from './routes/scores.routes';
import achievementsRouter from './routes/achievements.routes';
import sseRouter from './routes/sse.routes';

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
const allowedOrigins = config.corsOrigins.split(',').map((s) => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10kb' })); // Limit body size — security
app.use(globalLimiter); // Rate limit all endpoints

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
app.use('/api/achievements', achievementsRouter);
app.use('/api/sse', sseRouter);

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
