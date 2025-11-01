import { GameState, Achievement } from '@/types/yks-quest';

export const checkAchievements = (gameState: GameState): Achievement[] => {
  const unlockedAchievements: Achievement[] = [];

  gameState.achievements.forEach((achievement, index) => {
    if (achievement.unlocked) return;

    let shouldUnlock = false;

    switch (achievement.id) {
      case 'first_quest':
        shouldUnlock = gameState.completedQuests >= 1;
        break;
      case 'first_week':
        shouldUnlock = gameState.streak >= 7;
        break;
      case 'level_5':
        shouldUnlock = gameState.level >= 5;
        break;
      case 'level_10':
        shouldUnlock = gameState.level >= 10;
        break;
      case 'quest_master':
        shouldUnlock = gameState.completedQuests >= 50;
        break;
      case 'focus_champion':
        shouldUnlock = gameState.focusSessions.total >= 25;
        break;
      case 'habit_hero':
        shouldUnlock = gameState.habits.some(h => h.streak >= 30);
        break;
      case 'streak_legend':
        shouldUnlock = gameState.streak >= 30;
        break;
    }

    if (shouldUnlock) {
      unlockedAchievements.push({ ...achievement, unlocked: true });
    }
  });

  return unlockedAchievements;
};

export const calculateLevel = (totalXP: number): number => {
  // Her seviye için gereken XP: Level * 100
  return Math.floor(totalXP / 100) + 1;
};

export const getXPForNextLevel = (level: number): number => {
  return level * 100;
};

export const getCurrentLevelXP = (totalXP: number, level: number): number => {
  const previousLevelXP = (level - 1) * 100;
  return totalXP - previousLevelXP;
};
