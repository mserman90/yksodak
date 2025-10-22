import { Check } from 'lucide-react';
import { GameState, Quest } from '@/types/yks-quest';
import { Card } from '@/components/ui/card';
import { useRewardPopup } from './RewardPopup';

interface QuestsTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const QuestsTab = ({ gameState, updateGameState }: QuestsTabProps) => {
  const { open } = useRewardPopup();

  const completeQuest = (type: 'daily' | 'weekly' | 'special', index: number) => {
    const quest = gameState.quests[type][index];
    if (quest.completed) return;

    updateGameState((prev) => {
      const newQuests = { ...prev.quests };
      newQuests[type] = [...newQuests[type]];
      newQuests[type][index] = { ...newQuests[type][index], completed: true };

      const newXP = prev.currentXP + quest.xp;
      const newTotalXP = prev.totalXP + quest.xp;

      return {
        ...prev,
        quests: newQuests,
        currentXP: newXP,
        totalXP: newTotalXP,
        completedQuests: prev.completedQuests + 1,
      };
    });

    open('🎊', 'Görev Tamamlandı!', `"${quest.name}" görevini tamamladın! +${quest.xp} XP kazandın!`);
  };

  const renderQuest = (quest: Quest, index: number, type: 'daily' | 'weekly' | 'special') => (
    <Card key={quest.id} className={`p-4 transition-all hover:shadow-lg ${quest.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{quest.icon}</span>
          <div className="flex-1">
            <h4 className="font-bold">{quest.name}</h4>
            <p className="text-sm text-muted-foreground">{quest.description}</p>
            {quest.target && (
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${((quest.progress || 0) / quest.target) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-yellow-600 font-bold">+{quest.xp} XP</span>
          {!quest.completed ? (
            <button
              onClick={() => completeQuest(type, index)}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition"
            >
              <Check className="w-5 h-5" />
            </button>
          ) : (
            <span className="text-green-500 text-2xl">✓</span>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Daily Quests */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">☀️ Günlük Görevler</h3>
        </div>
        <div className="space-y-3">
          {gameState.quests.daily.map((quest, index) => renderQuest(quest, index, 'daily'))}
        </div>
      </Card>

      {/* Weekly Quests */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📅 Haftalık Görevler</h3>
        <div className="space-y-3">
          {gameState.quests.weekly.map((quest, index) => renderQuest(quest, index, 'weekly'))}
        </div>
      </Card>

      {/* Special Challenges */}
      <Card className="p-6 md:col-span-2">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">⭐ Özel Meydan Okumalar</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {gameState.quests.special.map((quest, index) => renderQuest(quest, index, 'special'))}
        </div>
      </Card>
    </div>
  );
};
