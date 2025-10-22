import { Card } from '@/components/ui/card';
import { GameState } from '@/types/yks-quest';
import { Lock } from 'lucide-react';

interface AchievementsTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const AchievementsTab = ({ gameState }: AchievementsTabProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold mb-6">🏆 Başarımlar ve Rozetler</h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gameState.achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`p-4 text-center transition-all hover:scale-105 ${
              achievement.unlocked ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900' : 'opacity-40 grayscale'
            }`}
          >
            <div className="text-5xl mb-3">{achievement.icon}</div>
            <h4 className="font-bold mb-1">{achievement.name}</h4>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            {!achievement.unlocked && (
              <div className="mt-2 text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                <span className="text-xs">Kilitli</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
};
