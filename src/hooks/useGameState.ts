import { useState, useEffect } from 'react';
import { GameState } from '@/types/yks-quest';
import { questTemplates, achievementTemplates } from '@/lib/yks-quest-templates';
import { calculateLevel } from '@/lib/achievement-checker';

const defaultGameState: GameState = {
  level: 1,
  currentXP: 0,
  totalXP: 0,
  stats: { discipline: 1, focus: 1, energy: 1, knowledge: 1 },
  skillPoints: 0,
  streak: 0,
  longestStreak: 0,
  completedQuests: 0,
  achievements: [],
  habits: [],
  todos: [],
  medications: [],
  lastLogin: null,
  firstLogin: null,
  lastDailyReward: null,
  lastReset: null,
  focusSessions: { today: 0, week: 0, total: 0, totalMinutes: 0 },
  quests: {
    daily: [],
    weekly: [],
    special: [],
  },
  xpHistory: [],
  journalEntries: [],
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = () => {
    try {
      const savedState = localStorage.getItem('yksQuestSave');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Ensure new properties are added
        Object.keys(defaultGameState).forEach((key) => {
          if (parsed[key] === undefined) {
            parsed[key] = JSON.parse(JSON.stringify(defaultGameState[key as keyof GameState]));
          }
        });
        
        // Seviyeyi totalXP'den yeniden hesapla
        parsed.level = calculateLevel(parsed.totalXP);
        
        setGameState(parsed);
      } else {
        const newState = {
          ...defaultGameState,
          firstLogin: new Date().toISOString(),
          quests: JSON.parse(JSON.stringify(questTemplates)),
          achievements: JSON.parse(JSON.stringify(achievementTemplates)),
        };
        setGameState(newState);
        localStorage.setItem('yksQuestSave', JSON.stringify(newState));
      }
    } catch (e) {
      console.error('Could not load game state:', e);
      setGameState(defaultGameState);
    }
  };

  const updateGameState = (updates: Partial<GameState> | ((prev: GameState) => GameState)) => {
    setGameState((prev) => {
      const newState = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      localStorage.setItem('yksQuestSave', JSON.stringify(newState));
      return newState;
    });
  };

  return { gameState, updateGameState, setGameState };
};
