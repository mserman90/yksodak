import { Card } from '@/components/ui/card';
import { GameState } from '@/types/yks-quest';

interface JournalTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const JournalTab = ({ gameState }: JournalTabProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">Bugün Nasılsın?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Günlük ruh halini ve enerjini kaydet. Bu sayede ilerlemeni takip edebilirsin.
        </p>
        <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition">
          Günlük Kaydet
        </button>
      </Card>

      <Card className="p-6 md:col-span-2">
        <h3 className="text-2xl font-bold mb-4">📝 Son Kayıtlar</h3>
        <div className="space-y-3">
          {gameState.journalEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Henüz günlük kaydı yok.</p>
          ) : (
            gameState.journalEntries.slice(0, 5).map((entry, index) => (
              <div key={index} className="bg-secondary p-3 rounded-lg border-l-4 border-teal-500">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold">{new Date(entry.date).toLocaleDateString('tr-TR')}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span>Ruh Hali: {entry.mood}</span>
                    <span>Enerji: {entry.energy}/5</span>
                  </div>
                </div>
                {entry.notes && <p className="text-sm text-muted-foreground italic">"{entry.notes}"</p>}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
