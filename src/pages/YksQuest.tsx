import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Calendar, Brain, CheckCircle, BookOpen, BarChart3, HelpCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TopBar } from '@/components/yks-quest/TopBar';
import { QuestsTab } from '@/components/yks-quest/QuestsTab';
import { CharacterTab } from '@/components/yks-quest/CharacterTab';
import { PlannerTab } from '@/components/yks-quest/PlannerTab';
import { AchievementsTab } from '@/components/yks-quest/AchievementsTab';
import { FocusTab } from '@/components/yks-quest/FocusTab';
import { HabitsTab } from '@/components/yks-quest/HabitsTab';
import { JournalTab } from '@/components/yks-quest/JournalTab';
import { StatsTab } from '@/components/yks-quest/StatsTab';
import { HelpTab } from '@/components/yks-quest/HelpTab';
import { RewardPopup } from '@/components/yks-quest/RewardPopup';
import { useGameState } from '@/hooks/useGameState';

const YksQuest = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('quests');
  const { gameState, updateGameState } = useGameState();
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setLoading(false);
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    document.title = 'YKS Quest - DEHB Oyunlaştırma Sistemi';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'quests', label: 'Görevler', icon: BookOpen },
    { id: 'character', label: 'Karakterim', icon: Trophy },
    { id: 'planner', label: 'Planlayıcı', icon: Calendar },
    { id: 'achievements', label: 'Başarımlar', icon: Trophy },
    { id: 'focus', label: 'Odaklanma', icon: Brain },
    { id: 'habits', label: 'Alışkanlıklar', icon: CheckCircle },
    { id: 'journal', label: 'Günlük', icon: BookOpen },
    { id: 'stats', label: 'İstatistikler', icon: BarChart3 },
    { id: 'help', label: 'Yardım', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Install Button */}
      <div className="container mx-auto px-4 pt-4 flex justify-end items-center">
        <Link
          to="/install"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition font-semibold"
        >
          <Download className="w-5 h-5" />
          Telefonuna Yükle
        </Link>
      </div>

      <TopBar gameState={gameState} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide bg-card p-2 rounded-2xl shadow-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl whitespace-nowrap font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform -translate-y-1'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'quests' && <QuestsTab gameState={gameState} updateGameState={updateGameState} />}
        {activeTab === 'character' && <CharacterTab gameState={gameState} updateGameState={updateGameState} />}
        {activeTab === 'planner' && <PlannerTab gameState={gameState} updateGameState={updateGameState} />}
        {activeTab === 'achievements' && <AchievementsTab gameState={gameState} updateGameState={updateGameState} />}
        {activeTab === 'focus' && <FocusTab gameState={gameState} updateGameState={updateGameState} />}
        {activeTab === 'habits' && <HabitsTab gameState={gameState} updateGameState={updateGameState} />}
        {activeTab === 'journal' && <JournalTab gameState={gameState} updateGameState={updateGameState} />}
        {activeTab === 'stats' && <StatsTab gameState={gameState} />}
        {activeTab === 'help' && <HelpTab />}
      </div>

      <RewardPopup />
    </div>
  );
};

export default YksQuest;
