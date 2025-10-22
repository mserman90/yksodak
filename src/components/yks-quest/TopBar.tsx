import { Brain, Flame } from 'lucide-react';
import { GameState } from '@/types/yks-quest';

interface TopBarProps {
  gameState: GameState;
}

export const TopBar = ({ gameState }: TopBarProps) => {
  const getRequiredXP = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));
  const requiredXP = getRequiredXP(gameState.level);
  const xpPercent = Math.min((gameState.currentXP / requiredXP) * 100, 100);

  return (
    <div className="bg-card shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Character Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-lg">
              <Brain className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold">YKS Odak</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm">
                  Seviye {gameState.level}
                </span>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-xs flex items-center gap-1">
                  <Flame className="w-4 h-4" /> {gameState.streak} Gün
                </span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold">
                XP: {gameState.currentXP} / {requiredXP}
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">
                Toplam: {gameState.totalXP} XP
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <button className="text-center px-3 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg hover:scale-110 transition">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {gameState.totalXP}
              </div>
              <div className="text-xs text-muted-foreground">Puan</div>
            </button>
            <button className="text-center px-3 py-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg hover:scale-110 transition">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {gameState.achievements.filter((a) => a.unlocked).length}/
                {gameState.achievements.length}
              </div>
              <div className="text-xs text-muted-foreground">Başarım</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
