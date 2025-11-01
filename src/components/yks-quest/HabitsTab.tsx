import { Card } from '@/components/ui/card';
import { GameState } from '@/types/yks-quest';
import { useRewardPopup } from './RewardPopup';
import { checkAchievements } from '@/lib/achievement-checker';

interface HabitsTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const HabitsTab = ({ gameState, updateGameState }: HabitsTabProps) => {
  const { open } = useRewardPopup();

  const completeHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    updateGameState((prev) => {
      const habitIndex = prev.habits.findIndex(h => h.id === habitId);
      if (habitIndex === -1) return prev;

      const habit = prev.habits[habitIndex];
      
      // Bugün zaten tamamlanmış mı kontrol et
      if (habit.completedDates.includes(today)) return prev;

      const newStreak = habit.streak + 1;
      const newCompletedDates = [...habit.completedDates, today];
      
      const updatedHabits = [...prev.habits];
      updatedHabits[habitIndex] = {
        ...habit,
        streak: newStreak,
        completedDates: newCompletedDates,
      };

      const newTotalXP = prev.totalXP + habit.xp;
      
      // Başarımları kontrol et
      const unlockedAchievements = checkAchievements({
        ...prev,
        habits: updatedHabits,
        totalXP: newTotalXP,
      });

      const updatedAchievements = prev.achievements.map((achievement) => {
        const unlocked = unlockedAchievements.find((a) => a.id === achievement.id);
        return unlocked ? { ...achievement, unlocked: true } : achievement;
      });

      return {
        ...prev,
        habits: updatedHabits,
        totalXP: newTotalXP,
        currentXP: (prev.currentXP + habit.xp) % 100,
        achievements: updatedAchievements,
      };
    });

    const habit = gameState.habits.find(h => h.id === habitId);
    if (habit) {
      open('🎯', 'Alışkanlık Tamamlandı!', `"${habit.name}" alışkanlığını tamamladın! +${habit.xp} XP`);

      // Streak ödülü
      if ((habit.streak + 1) % 7 === 0) {
        setTimeout(() => {
          open('🔥', 'Streak Ödülü!', `${habit.streak + 1} günlük seriyi tamamladın! Harika gidiyorsun!`);
        }, 1500);
      }
    }
  };
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
            gameState.habits.map((habit) => {
              const today = new Date().toISOString().split('T')[0];
              const completedToday = habit.completedDates.includes(today);
              
              return (
                <div key={habit.id} className={`bg-secondary p-4 rounded-lg flex items-center justify-between ${completedToday ? 'opacity-60' : ''}`}>
                  <div>
                    <h4 className="font-bold">{habit.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      +{habit.xp} XP · {habit.streak} günlük seri {habit.streak > 0 && '🔥'}
                    </p>
                  </div>
                  {!completedToday ? (
                    <button 
                      onClick={() => completeHabit(habit.id)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition"
                    >
                      ✓
                    </button>
                  ) : (
                    <span className="text-green-500 text-2xl">✓</span>
                  )}
                </div>
              );
            })
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
