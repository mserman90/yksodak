import { Card } from '@/components/ui/card';
import { GameState } from '@/types/yks-quest';

interface StatsTabProps {
  gameState: GameState;
}

export const StatsTab = ({ gameState }: StatsTabProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">📊 Genel İstatistikler</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Seviye:</span>
            <span className="font-bold">{gameState.level}</span>
          </div>
          <div className="flex justify-between">
            <span>Toplam XP:</span>
            <span className="font-bold">{gameState.totalXP}</span>
          </div>
          <div className="flex justify-between">
            <span>Seri:</span>
            <span className="font-bold">{gameState.streak} Gün</span>
          </div>
          <div className="flex justify-between">
            <span>En Uzun Seri:</span>
            <span className="font-bold">{gameState.longestStreak} Gün</span>
          </div>
          <div className="flex justify-between">
            <span>Tamamlanan Görev:</span>
            <span className="font-bold">{gameState.completedQuests}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">🎯 Odaklanma</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Bugün:</span>
            <span className="font-bold">{gameState.focusSessions.today} seans</span>
          </div>
          <div className="flex justify-between">
            <span>Bu Hafta:</span>
            <span className="font-bold">{gameState.focusSessions.week} seans</span>
          </div>
          <div className="flex justify-between">
            <span>Toplam:</span>
            <span className="font-bold">{gameState.focusSessions.total} seans</span>
          </div>
          <div className="flex justify-between">
            <span>Toplam Süre:</span>
            <span className="font-bold">
              {Math.floor(gameState.focusSessions.totalMinutes / 60)}h {gameState.focusSessions.totalMinutes % 60}m
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">🏆 Başarımlar</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Açılan Başarım:</span>
            <span className="font-bold">
              {gameState.achievements.filter((a) => a.unlocked).length} / {gameState.achievements.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Alışkanlıklar:</span>
            <span className="font-bold">{gameState.habits.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Günlük Kayıtları:</span>
            <span className="font-bold">{gameState.journalEntries.length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
