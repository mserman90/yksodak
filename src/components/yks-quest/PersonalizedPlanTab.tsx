import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameState, SubjectPerformance, StudyTimeLog, ExamResult } from '@/types/yks-quest';
import { Plus, Sparkles, TrendingUp, Clock, Target, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PersonalizedPlanTabProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => GameState)) => void;
}

export const PersonalizedPlanTab = ({ gameState, updateGameState }: PersonalizedPlanTabProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<string>('');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTimeLogForm, setShowTimeLogForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);

  // Subject Performance Form State
  const [subjectName, setSubjectName] = useState('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [empty, setEmpty] = useState(0);

  // Study Time Log Form State
  const [studyHour, setStudyHour] = useState(9);
  const [productivity, setProductivity] = useState(5);

  // Exam Result Form State
  const [examDate, setExamDate] = useState('');
  const [mathNet, setMathNet] = useState(0);
  const [scienceNet, setScienceNet] = useState(0);
  const [turkishNet, setTurkishNet] = useState(0);
  const [socialNet, setSocialNet] = useState(0);

  const addSubjectPerformance = () => {
    if (!subjectName.trim()) return;
    const total = correct + wrong + empty;
    if (total === 0) return;
    
    const performance: SubjectPerformance = {
      name: subjectName,
      correct,
      wrong,
      empty,
      successRate: (correct / total) * 100,
    };

    updateGameState((prev) => ({
      ...prev,
      subjectPerformances: [...prev.subjectPerformances, performance],
    }));

    setSubjectName('');
    setCorrect(0);
    setWrong(0);
    setEmpty(0);
    setShowSubjectForm(false);
    toast({ title: 'Başarılı!', description: 'Konu performansı eklendi.' });
  };

  const addStudyTimeLog = () => {
    const log: StudyTimeLog = {
      hour: studyHour,
      productivity,
      date: new Date().toISOString(),
    };

    updateGameState((prev) => ({
      ...prev,
      studyTimeLogs: [...prev.studyTimeLogs, log],
    }));

    setStudyHour(9);
    setProductivity(5);
    setShowTimeLogForm(false);
    toast({ title: 'Başarılı!', description: 'Çalışma saati verisi eklendi.' });
  };

  const addExamResult = () => {
    if (!examDate) return;
    
    const subjects = [
      { name: 'Matematik', net: mathNet },
      { name: 'Fen', net: scienceNet },
      { name: 'Türkçe', net: turkishNet },
      { name: 'Sosyal', net: socialNet },
    ];

    const result: ExamResult = {
      date: examDate,
      totalNet: mathNet + scienceNet + turkishNet + socialNet,
      subjects,
    };

    updateGameState((prev) => ({
      ...prev,
      examResults: [...prev.examResults, result],
    }));

    setExamDate('');
    setMathNet(0);
    setScienceNet(0);
    setTurkishNet(0);
    setSocialNet(0);
    setShowExamForm(false);
    toast({ title: 'Başarılı!', description: 'Deneme sınavı sonucu eklendi.' });
  };

  const generatePersonalizedPlan = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-study-plan', {
        body: {
          subjectPerformances: gameState.subjectPerformances,
          studyTimeLogs: gameState.studyTimeLogs,
          examResults: gameState.examResults,
          stats: gameState.stats,
          focusSessions: gameState.focusSessions,
        },
      });

      if (error) throw error;
      
      setAiPlan(data.plan);
      toast({ title: 'Başarılı!', description: 'Kişisel çalışma planınız hazır!' });
    } catch (error) {
      console.error('AI plan generation error:', error);
      toast({ 
        title: 'Hata', 
        description: 'Plan oluşturulurken bir hata oluştu.', 
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getOptimalStudyHours = () => {
    if (gameState.studyTimeLogs.length === 0) return [];
    
    const hourMap = new Map<number, number[]>();
    gameState.studyTimeLogs.forEach(log => {
      if (!hourMap.has(log.hour)) {
        hourMap.set(log.hour, []);
      }
      hourMap.get(log.hour)!.push(log.productivity);
    });

    const averages = Array.from(hourMap.entries()).map(([hour, productivities]) => ({
      hour,
      avgProductivity: productivities.reduce((a, b) => a + b, 0) / productivities.length,
    }));

    return averages.sort((a, b) => b.avgProductivity - a.avgProductivity).slice(0, 3);
  };

  const getWeakSubjects = () => {
    return [...gameState.subjectPerformances]
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 3);
  };

  const getStrongSubjects = () => {
    return [...gameState.subjectPerformances]
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3);
  };

  const optimalHours = getOptimalStudyHours();
  const weakSubjects = getWeakSubjects();
  const strongSubjects = getStrongSubjects();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg text-white">
        <h2 className="text-3xl font-bold mb-2">⭐ Kişiselleştirilmiş Çalışma Planı</h2>
        <p className="opacity-90">
          Senin öğrenme tarzına özel, AI destekli çalışma planı. Güçlü ve zayıf yönlerini analiz et!
        </p>
      </div>

      {/* Analysis Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-bold">Güçlü Konular</h3>
          </div>
          {strongSubjects.length === 0 ? (
            <p className="text-muted-foreground text-sm">Henüz veri yok</p>
          ) : (
            <div className="space-y-2">
              {strongSubjects.map((subject, i) => (
                <div key={i} className="bg-secondary p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-green-600 font-bold">%{subject.successRate.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-bold">Gelişim Alanları</h3>
          </div>
          {weakSubjects.length === 0 ? (
            <p className="text-muted-foreground text-sm">Henüz veri yok</p>
          ) : (
            <div className="space-y-2">
              {weakSubjects.map((subject, i) => (
                <div key={i} className="bg-secondary p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-red-600 font-bold">%{subject.successRate.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold">En Verimli Saatler</h3>
          </div>
          {optimalHours.length === 0 ? (
            <p className="text-muted-foreground text-sm">Henüz veri yok</p>
          ) : (
            <div className="space-y-2">
              {optimalHours.map((item, i) => (
                <div key={i} className="bg-secondary p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.hour}:00 - {item.hour + 1}:00</span>
                    <span className="text-blue-600 font-bold">⭐ {item.avgProductivity.toFixed(1)}/10</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Data Input Sections */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">📚 Konu Performansı Ekle</h3>
          {!showSubjectForm ? (
            <Button onClick={() => setShowSubjectForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Ekle
            </Button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Konu adı (ör: Türev)"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Doğru sayısı"
                value={correct}
                onChange={(e) => setCorrect(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Yanlış sayısı"
                value={wrong}
                onChange={(e) => setWrong(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Boş sayısı"
                value={empty}
                onChange={(e) => setEmpty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
              />
              <div className="flex gap-2">
                <Button onClick={addSubjectPerformance} className="flex-1">Kaydet</Button>
                <Button onClick={() => setShowSubjectForm(false)} variant="outline">İptal</Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">⏰ Çalışma Saati Kaydı</h3>
          {!showTimeLogForm ? (
            <Button onClick={() => setShowTimeLogForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Ekle
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Çalışma Saati</label>
                <select
                  value={studyHour}
                  onChange={(e) => setStudyHour(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i}:00 - {i + 1}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Verimlilik (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={productivity}
                  onChange={(e) => setProductivity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center font-bold text-lg">{productivity}/10</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addStudyTimeLog} className="flex-1">Kaydet</Button>
                <Button onClick={() => setShowTimeLogForm(false)} variant="outline">İptal</Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">📊 Deneme Sonucu Ekle</h3>
          {!showExamForm ? (
            <Button onClick={() => setShowExamForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Ekle
            </Button>
          ) : (
            <div className="space-y-3">
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Matematik Net"
                value={mathNet}
                onChange={(e) => setMathNet(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Fen Net"
                value={scienceNet}
                onChange={(e) => setScienceNet(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Türkçe Net"
                value={turkishNet}
                onChange={(e) => setTurkishNet(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Sosyal Net"
                value={socialNet}
                onChange={(e) => setSocialNet(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border-2 dark:bg-gray-700"
              />
              <div className="flex gap-2">
                <Button onClick={addExamResult} className="flex-1">Kaydet</Button>
                <Button onClick={() => setShowExamForm(false)} variant="outline">İptal</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* AI Plan Generation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-500" />
            <h3 className="text-2xl font-bold">AI Destekli Kişisel Çalışma Planı</h3>
          </div>
          <Button
            onClick={generatePersonalizedPlan}
            disabled={isGenerating || gameState.subjectPerformances.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {isGenerating ? (
              'Oluşturuluyor...'
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Plan Oluştur
              </>
            )}
          </Button>
        </div>
        
        {gameState.subjectPerformances.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            AI plan oluşturmak için önce veri eklemelisin! Konu performansı, çalışma saati ve deneme sonuçlarını ekle.
          </p>
        )}

        {aiPlan && (
          <div className="bg-secondary p-6 rounded-xl mt-4 whitespace-pre-wrap">
            {aiPlan}
          </div>
        )}

        {gameState.examResults.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-lg mb-3">📈 Deneme Sınavı Performans Tahmini</h4>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-500/20">
              <p className="text-sm mb-2">Son deneme netine göre tahmini sıralama:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Mevcut Net Ortalaması</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(gameState.examResults.reduce((sum, e) => sum + e.totalNet, 0) / gameState.examResults.length).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hedef Net (Artış için)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(gameState.examResults.reduce((sum, e) => sum + e.totalNet, 0) / gameState.examResults.length + 15).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
