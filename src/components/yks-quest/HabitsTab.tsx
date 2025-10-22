import { Card } from '@/components/ui/card';
import { GameState } from '@/types/yks-quest';

interface HabitsTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const HabitsTab = ({ gameState }: HabitsTabProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-6">✅ Günlük Alışkanlıklar</h3>
        <div className="space-y-3">
          {gameState.habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Henüz alışkanlık eklenmemiş. Yeni alışkanlık eklemek için butona tıklayın.
            </p>
          ) : (
            gameState.habits.map((habit) => (
              <div key={habit.id} className="bg-secondary p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{habit.name}</h4>
                  <p className="text-sm text-muted-foreground">+{habit.xp} XP · {habit.streak} günlük seri</p>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition">
                  ✓
                </button>
              </div>
            ))
          )}
        </div>
        <button className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold transition">
          + Yeni Alışkanlık Ekle
        </button>
      </Card>

      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-6">📅 Alışkanlık Takvimi</h3>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 p-4 rounded-lg">
          <h4 className="font-bold mb-2">💡 İpucu</h4>
          <p className="text-sm">
            Alışkanlıklarınızı her gün tamamlayarak seri oluşturun! Uzun seriler ekstra XP ve özel rozetler
            kazandırır.
          </p>
        </div>
      </Card>
    </div>
  );
};
