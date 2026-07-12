import app from './app';
import { config } from './config/env';
import { prisma } from './config/db';

// ═══════════════════════════════════════════════════════════
// Server Entry Point
//
// Responsibilities:
// 1. Connect to database
// 2. Start HTTP server
// 3. Handle graceful shutdown
//
// NOTHING else. No routes, no logic, no config.
// ═══════════════════════════════════════════════════════════

async function main(): Promise<void> {
  // ── Connect to database ──
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }

  // ── Start HTTP server ──
  const server = app.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║  🎮 Code Typist Arcade — Backend API         ║
║  ─────────────────────────────────────────── ║
║  Port:    ${String(config.port).padEnd(34)}║
║  Env:     ${config.nodeEnv.padEnd(34)}║
║  Health:  http://localhost:${String(config.port).padEnd(19)}║
║  Scores:  http://localhost:${String(config.port).padEnd(19)}║
╚══════════════════════════════════════════════╝
    `);
  });

  // ── Graceful Shutdown ──
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database disconnected. Goodbye.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
