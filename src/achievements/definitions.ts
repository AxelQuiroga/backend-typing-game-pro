// ═══════════════════════════════════════════════════════════
// Achievement Definitions — Code Typist Arcade
//
// Central registry of all achievements with their unlock
// conditions checked against a Score record.
// ═══════════════════════════════════════════════════════════

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'combo' | 'score' | 'level' | 'accuracy' | 'games';
  /** Return true if this score unlocks the achievement */
  check: (score: ScoreInput, totalGames?: number) => boolean;
}

export interface ScoreInput {
  score: number;
  level: number;
  wordsCompleted: number;
  correctLetters: number;
  totalLetters: number;
  accuracy: number;
  maxCombo: number;
  totalGames?: number; // injected from player stats
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Combo ──
  {
    key: 'combo_5',
    name: 'Combo Starter',
    description: 'Reach a 5x combo',
    icon: '🔥',
    category: 'combo',
    check: (s) => s.maxCombo >= 5,
  },
  {
    key: 'combo_10',
    name: 'Combo Master',
    description: 'Reach a 10x combo',
    icon: '🔥',
    category: 'combo',
    check: (s) => s.maxCombo >= 10,
  },
  {
    key: 'combo_20',
    name: 'Combo God',
    description: 'Reach a 20x combo',
    icon: '💥',
    category: 'combo',
    check: (s) => s.maxCombo >= 20,
  },
  {
    key: 'combo_50',
    name: 'Combo Legend',
    description: 'Reach a 50x combo',
    icon: '⚡',
    category: 'combo',
    check: (s) => s.maxCombo >= 50,
  },

  // ── Score ──
  {
    key: 'score_1000',
    name: 'Rookie',
    description: 'Score 1,000 points in one game',
    icon: '⭐',
    category: 'score',
    check: (s) => s.score >= 1000,
  },
  {
    key: 'score_5000',
    name: 'Pro',
    description: 'Score 5,000 points in one game',
    icon: '🌟',
    category: 'score',
    check: (s) => s.score >= 5000,
  },
  {
    key: 'score_10000',
    name: 'Legend',
    description: 'Score 10,000 points in one game',
    icon: '💎',
    category: 'score',
    check: (s) => s.score >= 10000,
  },
  {
    key: 'score_25000',
    name: 'Mythical',
    description: 'Score 25,000 points in one game',
    icon: '👑',
    category: 'score',
    check: (s) => s.score >= 25000,
  },

  // ── Level ──
  {
    key: 'level_5',
    name: 'Getting There',
    description: 'Reach level 5',
    icon: '📈',
    category: 'level',
    check: (s) => s.level >= 5,
  },
  {
    key: 'level_10',
    name: 'Level 10',
    description: 'Reach level 10',
    icon: '🚀',
    category: 'level',
    check: (s) => s.level >= 10,
  },
  {
    key: 'level_20',
    name: 'Speed Demon',
    description: 'Reach level 20',
    icon: '😈',
    category: 'level',
    check: (s) => s.level >= 20,
  },

  // ── Accuracy ──
  {
    key: 'accuracy_90',
    name: 'Sharpshooter',
    description: 'Finish a game with 90%+ accuracy',
    icon: '🎯',
    category: 'accuracy',
    check: (s) => s.totalLetters >= 50 && s.accuracy >= 90,
  },
  {
    key: 'accuracy_100',
    name: 'Perfect Run',
    description: 'Finish a game with 100% accuracy',
    icon: '✨',
    category: 'accuracy',
    check: (s) => s.totalLetters >= 20 && s.accuracy >= 100,
  },
  {
    key: 'words_50',
    name: 'Wordsmith',
    description: 'Complete 50 words in one game',
    icon: '📚',
    category: 'score',
    check: (s) => s.wordsCompleted >= 50,
  },

  // ── Games ──
  {
    key: 'first_game',
    name: 'First Blood',
    description: 'Play your first game',
    icon: '🎮',
    category: 'games',
    check: (_s, totalGames) => (totalGames ?? 0) >= 1,
  },
  {
    key: 'games_10',
    name: 'Veteran',
    description: 'Play 10 games',
    icon: '🏅',
    category: 'games',
    check: (_s, totalGames) => (totalGames ?? 0) >= 10,
  },
  {
    key: 'games_50',
    name: 'Addicted',
    description: 'Play 50 games',
    icon: '🏆',
    category: 'games',
    check: (_s, totalGames) => (totalGames ?? 0) >= 50,
  },
];

/** Get all achievements as a map keyed by key */
export function getAchievementMap(): Map<string, AchievementDef> {
  return new Map(ACHIEVEMENTS.map((a) => [a.key, a]));
}
