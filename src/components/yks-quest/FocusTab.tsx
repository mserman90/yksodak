import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { GameState } from '@/types/yks-quest';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useRewardPopup } from './RewardPopup';
import { useNotifications } from '@/hooks/useNotifications';

interface FocusTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const FocusTab = ({ gameState, updateGameState }: FocusTabProps) => {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const { open } = useRewardPopup();
  const { sendNotification } = useNotifications();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const handleTimerComplete = () => {
    setTimerRunning(false);
    
    if (isWorkMode) {
      updateGameState((prev) => ({
        ...prev,
        focusSessions: {
          ...prev.focusSessions,
          today: prev.focusSessions.today + 1,
          week: prev.focusSessions.week + 1,
          total: prev.focusSessions.total + 1,
          totalMinutes: prev.focusSessions.totalMinutes + workDuration,
        },
        currentXP: prev.currentXP + 25,
        totalXP: prev.totalXP + 25,
      }));
      
      sendNotification('🎯 Odaklanma Tamamlandı!', 'Harika çalışma! +25 XP kazandın. Şimdi mola zamanı!');
      open('🎯', 'Odaklanma Tamamlandı!', 'Harika çalışma! +25 XP kazandın. Şimdi mola zamanı!');
      setIsWorkMode(false);
      setTimerSeconds(breakDuration * 60);
    } else {
      sendNotification('☕ Mola Bitti!', 'Molan bitti! Çalışmaya geri dönmeye hazır mısın?');
      open('☕', 'Mola Bitti!', 'Molan bitti! Çalışmaya geri dönmeye hazır mısın?');
      setIsWorkMode(true);
      setTimerSeconds(workDuration * 60);
    }
  };

  const handleStartTimer = () => {
    if (!timerRunning) {
      sendNotification(
        '🎯 Pomodoro Başladı',
        `${workDuration} dakikalık odaklanma seansın başladı! Başarılar!`
      );
    }
    setTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-8">
        <h3 className="text-2xl font-bold mb-6 text-center">⏱️ Odaklanma Zamanlayıcı</h3>
        <div className="text-center mb-8">
          <div className="text-7xl font-bold text-purple-600 dark:text-purple-400 mb-4">
            {formatTime(timerSeconds)}
          </div>
          <div className="text-lg text-muted-foreground">
            {isWorkMode ? 'Çalışma Modu' : 'Mola Modu'}
          </div>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          {!timerRunning ? (
            <button
              onClick={handleStartTimer}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> Başlat
            </button>
          ) : (
            <button
              onClick={() => setTimerRunning(false)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <Pause className="w-5 h-5" /> Duraklat
            </button>
          )}
          <button
            onClick={() => {
              setTimerRunning(false);
              setTimerSeconds((isWorkMode ? workDuration : breakDuration) * 60);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold transition flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Sıfırla
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Çalışma Süresi (dakika)</label>
            <input
              type="number"
              value={workDuration}
              onChange={(e) => setWorkDuration(parseInt(e.target.value))}
              min="1"
              max="120"
              className="w-full px-4 py-2 rounded-lg border-2 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Mola Süresi (dakika)</label>
            <input
              type="number"
              value={breakDuration}
              onChange={(e) => setBreakDuration(parseInt(e.target.value))}
              min="1"
              max="30"
              className="w-full px-4 py-2 rounded-lg border-2 dark:bg-gray-700"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">📊 Odaklanma İstatistikleri</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Bugün</span>
              <span className="text-2xl font-bold text-blue-600">{gameState.focusSessions.today}</span>
            </div>
            <div className="text-sm text-muted-foreground">Tamamlanan Seans</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Bu Hafta</span>
              <span className="text-2xl font-bold text-green-600">{gameState.focusSessions.week}</span>
            </div>
            <div className="text-sm text-muted-foreground">Tamamlanan Seans</div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Toplam Süre</span>
              <span className="text-xl font-bold text-purple-600">
                {Math.floor(gameState.focusSessions.totalMinutes / 60)}h {gameState.focusSessions.totalMinutes % 60}m
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Odaklanma Süresi</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
