import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { GameState, Todo, Medication } from '@/types/yks-quest';
import { useNotifications } from '@/hooks/useNotifications';
import { Trash2, Plus, Bell, BellOff, CheckCircle } from 'lucide-react';

interface PlannerTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const PlannerTab = ({ gameState, updateGameState }: PlannerTabProps) => {
  const [newTodo, setNewTodo] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const { 
    permission, 
    requestPermission, 
    scheduleMedicationReminders, 
    scheduleDeadlineReminders,
    scheduleMotivationMessages 
  } = useNotifications();

  useEffect(() => {
    if (permission === 'granted') {
      scheduleMedicationReminders(gameState.medications);
      scheduleDeadlineReminders(gameState.todos);
      const cleanup = scheduleMotivationMessages();
      return cleanup;
    }
  }, [gameState.medications, gameState.todos, permission]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: Todo = {
      id: Date.now(),
      text: newTodo,
      deadline: newDeadline || null,
      completed: false,
    };
    updateGameState((prev) => ({
      ...prev,
      todos: [...prev.todos, todo],
    }));
    setNewTodo('');
    setNewDeadline('');
  };

  const toggleTodo = (id: number) => {
    updateGameState((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  };

  const deleteTodo = (id: number) => {
    updateGameState((prev) => ({
      ...prev,
      todos: prev.todos.filter((todo) => todo.id !== id),
    }));
  };

  const addMedication = () => {
    if (!newMedName.trim() || !newMedTime) return;
    const med: Medication = {
      id: Date.now(),
      name: newMedName,
      time: newMedTime,
      takenToday: false,
    };
    updateGameState((prev) => ({
      ...prev,
      medications: [...prev.medications, med],
    }));
    setNewMedName('');
    setNewMedTime('');
  };

  const toggleMedication = (id: number) => {
    updateGameState((prev) => ({
      ...prev,
      medications: prev.medications.map((med) =>
        med.id === id ? { ...med, takenToday: !med.takenToday } : med
      ),
    }));
  };

  const deleteMedication = (id: number) => {
    updateGameState((prev) => ({
      ...prev,
      medications: prev.medications.filter((med) => med.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Notification Permission Banner */}
      {permission !== 'granted' && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-start gap-4">
            <Bell className="w-8 h-8 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🔔 Bildirimleri Aç - DEHB için Kritik!</h3>
              <p className="mb-4 opacity-90">
                Zaman körlüğü (time blindness) yaşıyorsan bildirimler hayat kurtarıcı! 
                İlaç hatırlatmaları, görev deadline'ları ve motivasyon mesajları al.
              </p>
              <button
                onClick={requestPermission}
                className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Bildirimleri Aktif Et
              </button>
            </div>
          </div>
        </div>
      )}

      {permission === 'granted' && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
          <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-300 font-medium">
            ✅ Bildirimler aktif! İlaç ve görev hatırlatmaları alacaksın.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* TO-DO LIST */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">📝 Yapılacaklar Listesi</h3>
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Yeni görev ekle..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="w-full px-4 py-2 rounded-lg border-2 dark:bg-gray-700"
            />
            <input
              type="datetime-local"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 dark:bg-gray-700"
            />
            <button 
              onClick={addTodo}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Görev Ekle
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {gameState.todos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Henüz görev eklenmemiş.</p>
            ) : (
              gameState.todos.map((todo) => (
                <div key={todo.id} className="bg-secondary p-3 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`font-medium ${todo.completed ? 'line-through opacity-50' : ''}`}>
                        {todo.text}
                      </p>
                      {todo.deadline && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ⏰ {new Date(todo.deadline).toLocaleString('tr-TR')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`p-2 rounded transition ${
                          todo.completed 
                            ? 'bg-gray-500 hover:bg-gray-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        } text-white`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* MEDICATION TRACKER */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">💊 İlaç Takibi</h3>
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="İlaç adı..."
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 dark:bg-gray-700"
            />
            <input
              type="time"
              value={newMedTime}
              onChange={(e) => setNewMedTime(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 dark:bg-gray-700"
            />
            <button 
              onClick={addMedication}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> İlaç Ekle
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {gameState.medications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Henüz ilaç eklenmemiş.</p>
            ) : (
              gameState.medications.map((med) => (
                <div key={med.id} className="bg-secondary p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-bold ${med.takenToday ? 'line-through opacity-50' : ''}`}>
                        {med.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">⏰ {med.time}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleMedication(med.id)}
                        className={`p-2 rounded transition ${
                          med.takenToday 
                            ? 'bg-gray-500 hover:bg-gray-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        } text-white`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteMedication(med.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
