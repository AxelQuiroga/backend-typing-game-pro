import dotenv from 'dotenv';
import path from 'path';

// ═══════════════════════════════════════════════════════════
// Environment Configuration
// Single source of truth for all env vars.
// Fails fast if required vars are missing.
// ═══════════════════════════════════════════════════════════

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`[CONFIG] Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  databaseUrl: requireEnv('DATABASE_URL'),
} as const;
