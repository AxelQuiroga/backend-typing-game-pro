// ═══════════════════════════════════════════════════════════
// AchievementService — Code Typist Arcade
//
// Checks achievement conditions against a submitted score,
// unlocks new achievements, and queries player progress.
// ═══════════════════════════════════════════════════════════

import { prisma } from '../config/db';
import { ACHIEVEMENTS, type ScoreInput } from './definitions';

export interface UnlockedAchievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface PlayerAchievementRecord {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: string;
}

/**
 * Ensure all achievement definitions exist in the DB (idempotent).
 * Called on startup or first use.
 */
export async function seedAchievements(): Promise<void> {
  for (const def of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: def.key },
      create: {
        key: def.key,
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
      },
      update: {
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
      },
    });
  }
}

/**
 * Check a score against all achievement rules.
 * Returns newly unlocked achievements (skips already-unlocked ones).
 * 
 * Prerequisites: seedAchievements() must have been called on startup.
 */
export async function checkAndUnlock(
  nickname: string,
  scoreInput: ScoreInput,
): Promise<UnlockedAchievement[]> {
  // Get player's existing unlocks
  const existing = await prisma.playerAchievement.findMany({
    where: { nickname },
    select: { achievement: true },
  });
  const unlockedIds = new Set(existing.map((e) => e.achievement));

  // Get total games for this player
  const totalGames = await prisma.score.count({ where: { nickname } });

  // Get all achievement records from DB
  const dbAchievements = await prisma.achievement.findMany();
  const dbMap = new Map(dbAchievements.map((a) => [a.key, a]));

  // Check all achievements
  const newUnlocks: UnlockedAchievement[] = [];

  for (const def of ACHIEVEMENTS) {
    const dbAch = dbMap.get(def.key);
    if (!dbAch) continue;

    // Skip already unlocked
    if (unlockedIds.has(dbAch.id)) continue;

    // Check condition
    if (def.check(scoreInput, totalGames)) {
      // Unlock it
      try {
        await prisma.playerAchievement.create({
          data: {
            nickname,
            achievement: dbAch.id,
          },
        });

        newUnlocks.push({
          key: def.key,
          name: def.name,
          description: def.description,
          icon: def.icon,
          category: def.category,
        });
      } catch {
        // Duplicate constraint — another request beat us, ignore
      }
    }
  }

  return newUnlocks;
}

/**
 * Get all achievements a player has unlocked.
 */
export async function getPlayerAchievements(
  nickname: string,
): Promise<PlayerAchievementRecord[]> {
  const records = await prisma.playerAchievement.findMany({
    where: { nickname },
    include: { achievementRef: true },
    orderBy: { unlockedAt: 'desc' },
  });

  return records.map((r) => ({
    key: r.achievementRef.key,
    name: r.achievementRef.name,
    description: r.achievementRef.description,
    icon: r.achievementRef.icon,
    category: r.achievementRef.category,
    unlockedAt: r.unlockedAt.toISOString(),
  }));
}

/**
 * Get all achievements with unlock status for a player.
 */
export async function getAchievementProgress(nickname: string) {
  const all = await prisma.achievement.findMany({ orderBy: { id: 'asc' } });
  const unlocked = await prisma.playerAchievement.findMany({
    where: { nickname },
    select: { achievement: true },
  });
  const unlockedSet = new Set(unlocked.map((u) => u.achievement));

  return all.map((a) => ({
    key: a.key,
    name: a.name,
    description: a.description,
    icon: a.icon,
    category: a.category,
    unlocked: unlockedSet.has(a.id),
  }));
}
