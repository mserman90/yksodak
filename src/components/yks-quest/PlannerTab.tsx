import { Card } from '@/components/ui/card';
import { GameState } from '@/types/yks-quest';

interface PlannerTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const PlannerTab = ({ gameState }: PlannerTabProps) => {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">📝 Yapılacaklar Listesi</h3>
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Yeni görev ekle..."
            className="w-full px-4 py-2 rounded-lg border-2 dark:bg-gray-700"
          />
          <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition">
            + Görev Ekle
          </button>
        </div>
        <div className="space-y-3">
          {gameState.todos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Henüz görev eklenmemiş.</p>
          ) : (
            gameState.todos.map((todo) => (
              <div key={todo.id} className="bg-secondary p-3 rounded-lg flex items-center justify-between">
                <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>
                <button className="bg-green-500 hover:bg-green-600 text-white p-1 rounded transition">✓</button>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">📅 Etkinlik Takvimi</h3>
          <p className="text-center text-muted-foreground py-8">Takvim görünümü yakında eklenecek...</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">💊 İlaç Takibi</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="İlaç adı..."
              className="flex-1 px-4 py-2 rounded-lg border-2 dark:bg-gray-700"
            />
            <button className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">
              + Ekle
            </button>
          </div>
          <div className="space-y-2">
            {gameState.medications.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Henüz ilaç eklenmemiş.</p>
            ) : (
              gameState.medications.map((med) => (
                <div key={med.id} className="bg-secondary p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">{med.name}</h4>
                    <p className="text-sm text-muted-foreground">{med.time}</p>
                  </div>
                  <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition">✓</button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
