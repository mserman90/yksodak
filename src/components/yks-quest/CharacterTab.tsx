import { Card } from '@/components/ui/card';
import { GameState } from '@/types/yks-quest';
import { Dumbbell, Eye, Battery, Brain, Gift } from 'lucide-react';

interface CharacterTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const CharacterTab = ({ gameState, updateGameState }: CharacterTabProps) => {
  const stats = [
    { key: 'discipline', label: 'Disiplin', icon: Dumbbell, color: 'red' },
    { key: 'focus', label: 'Odak', icon: Eye, color: 'blue' },
    { key: 'energy', label: 'Enerji', icon: Battery, color: 'green' },
    { key: 'knowledge', label: 'Bilgi', icon: Brain, color: 'purple' },
  ];

  const upgradeStat = (stat: keyof typeof gameState.stats) => {
    if (gameState.skillPoints > 0) {
      updateGameState((prev) => ({
        ...prev,
        stats: { ...prev.stats, [stat]: prev.stats[stat] + 1 },
        skillPoints: prev.skillPoints - 1,
      }));
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="p-6 md:col-span-2">
        <h3 className="text-2xl font-bold mb-6">Karakter Profili</h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900 dark:to-${color}-800 p-4 rounded-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold flex items-center gap-2">
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                  {label}
                </span>
                <span className={`text-xl font-bold text-${color}-600`}>
                  {gameState.stats[key as keyof typeof gameState.stats]}
                </span>
              </div>
              <div className={`w-full bg-${color}-200 dark:bg-${color}-700 rounded-full h-2`}>
                <div
                  className={`h-full bg-${color}-600 rounded-full transition-all`}
                  style={{ width: `${Math.min(gameState.stats[key as keyof typeof gameState.stats] * 10, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Skill Points */}
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900">
          <h4 className="font-bold mb-3">💎 Yetenek Puanları: {gameState.skillPoints}</h4>
          <div className="grid grid-cols-2 gap-2">
            {stats.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => upgradeStat(key as keyof typeof gameState.stats)}
                disabled={gameState.skillPoints === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {label} +1
              </button>
            ))}
          </div>
        </Card>
      </Card>

      {/* Sidebar Stats */}
      <div className="space-y-6">
        <Card className="p-4">
          <h4 className="font-bold mb-3">📊 İstatistikler</h4>
          <div className="space-y-2 text-sm">
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
              <span>Tamamlanan Görev:</span>
              <span className="font-bold">{gameState.completedQuests}</span>
            </div>
            <div className="flex justify-between">
              <span>Başarımlar:</span>
              <span className="font-bold">
                {gameState.achievements.filter((a) => a.unlocked).length}/{gameState.achievements.length}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900 dark:to-purple-900">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <Gift className="w-5 h-5" /> Günlük Ödül
          </h4>
          <p className="text-sm mb-3">Bugünün ödülünü topla!</p>
          <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition">
            <Gift className="w-5 h-5 inline mr-2" />
            Ödül Topla (+50 XP)
          </button>
        </Card>
      </div>
    </div>
  );
};
