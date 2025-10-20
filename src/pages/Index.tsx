import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Clock,
  CheckSquare,
  Calendar,
  CheckCircle2,
  Smile,
  BarChart3,
  Star,
  Moon,
  Sun,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { UserGuide } from "@/components/UserGuide";

type Tab = "pomodoro" | "tasks" | "planner" | "habits" | "mood" | "stats";
type Priority = "high" | "medium" | "low";
type Mood = 1 | 2 | 3 | 4 | 5;

interface Task {
  id: number;
  text: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
}

interface Plan {
  id: number;
  text: string;
}

interface Habit {
  id: number;
  text: string;
  completedDays: string[];
  createdAt: string;
}

interface MoodEntry {
  date: string;
  mood: Mood;
  note?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("pomodoro");
  const [darkMode, setDarkMode] = useState(false);
  const [points, setPoints] = useState(0);
  const { toast } = useToast();

  // Pomodoro state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");

  // Planner state
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyPlans, setWeeklyPlans] = useState<Record<string, Plan[]>>({});
  const [planInput, setPlanInput] = useState("");
  const [planDay, setPlanDay] = useState(0);

  // Habits state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitInput, setHabitInput] = useState("");

  // Mood state
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodNote, setMoodNote] = useState("");

  // Load from localStorage
  useEffect(() => {
    const loadData = () => {
      const saved = {
        darkMode: localStorage.getItem("darkMode") === "true",
        points: parseInt(localStorage.getItem("points") || "0"),
        pomodoroCount: parseInt(localStorage.getItem("pomodoroCount") || "0"),
        tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
        weeklyPlans: JSON.parse(localStorage.getItem("weeklyPlans") || "{}"),
        habits: JSON.parse(localStorage.getItem("habits") || "[]"),
        moodHistory: JSON.parse(localStorage.getItem("moodHistory") || "[]"),
      };
      
      setDarkMode(saved.darkMode);
      setPoints(saved.points);
      setPomodoroCount(saved.pomodoroCount);
      setTasks(saved.tasks);
      setWeeklyPlans(saved.weeklyPlans);
      setHabits(saved.habits);
      setMoodHistory(saved.moodHistory);
    };
    loadData();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("points", points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem("pomodoroCount", pomodoroCount.toString());
  }, [pomodoroCount]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("weeklyPlans", JSON.stringify(weeklyPlans));
  }, [weeklyPlans]);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));
  }, [moodHistory]);

  const addPoints = (amount: number) => {
    setPoints((prev) => prev + amount);
    toast({
      title: `+${amount} puan kazandın! 🌟`,
      description: `Toplam: ${points + amount} puan`,
    });
  };

  // Pomodoro functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsRunning(false);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration * 60);
  };

  const handleTimerComplete = () => {
    if (!isBreak) {
      setPomodoroCount((prev) => prev + 1);
      addPoints(25);
      toast({
        title: "🎉 Harika! Bir pomodoro tamamladın!",
        description: "Mola zamanı!",
      });

      const newCount = pomodoroCount + 1;
      setIsBreak(true);
      const breakTime = newCount % 4 === 0 ? longBreak : shortBreak;
      setTimeLeft(breakTime * 60);
    } else {
      toast({
        title: "Mola bitti!",
        description: "Tekrar çalışmaya başlayabilirsin.",
      });
      setIsBreak(false);
      setTimeLeft(workDuration * 60);
    }
  };

  const getProgressPercentage = () => {
    const totalTime = isBreak
      ? (pomodoroCount % 4 === 0 ? longBreak : shortBreak) * 60
      : workDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Task functions
  const addTask = () => {
    if (!taskInput.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir görev girin",
        variant: "destructive",
      });
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      text: taskInput,
      priority: taskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setTaskInput("");
    addPoints(5);
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          if (!task.completed) addPoints(10);
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast({ title: "Görev silindi" });
  };

  // Planner functions
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setDate(monday.getDate() + offset * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const addPlan = () => {
    if (!planInput.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir plan girin",
        variant: "destructive",
      });
      return;
    }

    const dates = getWeekDates(weekOffset);
    const dateKey = dates[planDay].toISOString().split("T")[0];

    const newPlan: Plan = {
      id: Date.now(),
      text: planInput,
    };

    setWeeklyPlans({
      ...weeklyPlans,
      [dateKey]: [...(weeklyPlans[dateKey] || []), newPlan],
    });

    setPlanInput("");
    addPoints(5);
    toast({ title: "Plan eklendi!" });
  };

  const deletePlan = (dateKey: string, planId: number) => {
    setWeeklyPlans({
      ...weeklyPlans,
      [dateKey]: weeklyPlans[dateKey].filter((p) => p.id !== planId),
    });
    toast({ title: "Plan silindi" });
  };

  // Habit functions
  const addHabit = () => {
    if (!habitInput.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir alışkanlık girin",
        variant: "destructive",
      });
      return;
    }

    const newHabit: Habit = {
      id: Date.now(),
      text: habitInput,
      completedDays: [],
      createdAt: new Date().toISOString(),
    };

    setHabits([newHabit, ...habits]);
    setHabitInput("");
    addPoints(5);
    toast({ title: "Alışkanlık eklendi!" });
  };

  const toggleHabitDay = (habitId: number, dateKey: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const isCompleted = habit.completedDays.includes(dateKey);
          if (!isCompleted) addPoints(10);
          return {
            ...habit,
            completedDays: isCompleted
              ? habit.completedDays.filter((d) => d !== dateKey)
              : [...habit.completedDays, dateKey],
          };
        }
        return habit;
      })
    );
  };

  const deleteHabit = (id: number) => {
    setHabits(habits.filter((h) => h.id !== id));
    toast({ title: "Alışkanlık silindi" });
  };

  // Mood functions
  const saveMood = () => {
    if (!selectedMood) {
      toast({
        title: "Hata",
        description: "Lütfen bir ruh hali seç",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const existingIndex = moodHistory.findIndex((m) => m.date === today);

    const newEntry: MoodEntry = {
      date: today,
      mood: selectedMood,
      note: moodNote,
    };

    if (existingIndex >= 0) {
      const updated = [...moodHistory];
      updated[existingIndex] = newEntry;
      setMoodHistory(updated);
    } else {
      setMoodHistory([newEntry, ...moodHistory]);
    }

    addPoints(5);
    toast({ title: "Ruh halin kaydedildi!" });
    setSelectedMood(null);
    setMoodNote("");
  };

  const moodEmojis = ["😢", "😟", "😐", "😊", "🤩"];
  const moodLabels = ["Çok Kötü", "Kötü", "Normal", "İyi", "Harika"];

  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const dayNamesFull = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const tabs = [
    { id: "pomodoro", icon: Clock, label: "Pomodoro" },
    { id: "tasks", icon: CheckSquare, label: "Görevler" },
    { id: "planner", icon: Calendar, label: "Planlayıcı" },
    { id: "habits", icon: CheckCircle2, label: "Alışkanlıklar" },
    { id: "mood", icon: Smile, label: "Ruh Halim" },
    { id: "stats", icon: BarChart3, label: "İstatistikler" },
  ];

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500";
      case "medium":
        return "border-l-4 border-l-amber-500";
      case "low":
        return "border-l-4 border-l-blue-500";
    }
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalStudyMinutes = pomodoroCount * workDuration;
  const currentStreak = habits.reduce((max, habit) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      if (habit.completedDays.includes(dateKey)) {
        streak++;
      } else {
        break;
      }
    }
    return Math.max(max, streak);
  }, 0);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="glass-strong sticky top-0 z-50 shadow-elegant border-b border-border/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">YKS Odak</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Senin için tasarlandı</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-primary/10 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full">
                <Star className="text-amber-500 fill-amber-500" size={16} />
                <span className="font-bold text-primary text-sm sm:text-base bounce-gentle">{points}</span>
              </div>
              <UserGuide />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mt-4 sm:mt-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                variant={activeTab === tab.id ? "default" : "secondary"}
                size="sm"
                className={`whitespace-nowrap transition-all text-xs sm:text-sm ${
                  activeTab === tab.id ? "gradient-primary text-white shadow-lg" : ""
                }`}
              >
                <Icon size={16} className="mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Pomodoro Tab */}
        {activeTab === "pomodoro" && (
          <Card className="glass p-4 sm:p-6 lg:p-8 shadow-premium fade-in border border-border/50">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Odaklanma Zamanı</h2>

              {/* Timer Circle */}
              <div className="relative inline-flex items-center justify-center mb-6 sm:mb-8">
                <svg className="w-48 h-48 sm:w-64 sm:h-64 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted sm:hidden"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-primary transition-all duration-1000 sm:hidden"
                    strokeDasharray="553"
                    strokeDashoffset={553 - (getProgressPercentage() * 553) / 100}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted hidden sm:block"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-primary transition-all duration-1000 hidden sm:block"
                    strokeDasharray="754"
                    strokeDashoffset={754 - (getProgressPercentage() * 754) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-4xl sm:text-6xl font-bold text-foreground">{formatTime(timeLeft)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                    {isBreak ? "Mola" : "Çalışma Modu"}
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                {!isRunning ? (
                  <Button
                    onClick={startTimer}
                    className="bg-success hover:bg-success/90 text-success-foreground px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-lg font-semibold"
                  >
                    <Play size={18} className="mr-2" />
                    Başla
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTimer}
                    className="bg-warning hover:bg-warning/90 text-warning-foreground px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-lg font-semibold"
                  >
                    <Pause size={18} className="mr-2" />
                    Duraklat
                  </Button>
                )}
                <Button
                  onClick={resetTimer}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-lg font-semibold"
                >
                  <RotateCcw size={18} className="mr-2" />
                  Sıfırla
                </Button>
              </div>

              {/* Timer Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                <div className="glass-strong rounded-xl p-3 sm:p-4 border border-border/50">
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-foreground">Çalışma (dk)</label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={workDuration}
                    onChange={(e) => {
                      setWorkDuration(parseInt(e.target.value));
                      if (!isRunning && !isBreak) setTimeLeft(parseInt(e.target.value) * 60);
                    }}
                    className="text-center text-base sm:text-lg font-semibold bg-background"
                  />
                </div>
                <div className="glass-strong rounded-xl p-3 sm:p-4 border border-border/50">
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-foreground">Kısa Mola (dk)</label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={shortBreak}
                    onChange={(e) => setShortBreak(parseInt(e.target.value))}
                    className="text-center text-base sm:text-lg font-semibold bg-background"
                  />
                </div>
                <div className="glass-strong rounded-xl p-3 sm:p-4 border border-border/50">
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-foreground">Uzun Mola (dk)</label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={longBreak}
                    onChange={(e) => setLongBreak(parseInt(e.target.value))}
                    className="text-center text-base sm:text-lg font-semibold bg-background"
                  />
                </div>
              </div>

              {/* Pomodoro Counter */}
              <div className="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-2 text-sm sm:text-base">
                <span className="text-muted-foreground">Tamamlanan Pomodoro:</span>
                <div className="flex space-x-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                        i < pomodoroCount % 4 ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-primary">
                  {pomodoroCount % 4}/4
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="fade-in">
            <Card className="glass p-4 sm:p-6 shadow-premium mb-4 sm:mb-6 border border-border/50">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center text-foreground">
                <CheckSquare className="mr-2 text-primary" size={20} />
                Görevlerim
              </h2>

              {/* Add Task Form */}
              <div className="glass-strong rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-border/50">
                <div className="flex flex-col gap-3">
                  <Input
                    placeholder="Yeni görev ekle (örn: Matematik 20 soru çöz)"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                    className="w-full bg-background"
                  />
                  <div className="flex gap-3">
                    <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as Priority)}>
                      <SelectTrigger className="flex-1 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        <SelectItem value="high">🔴 Yüksek Öncelik</SelectItem>
                        <SelectItem value="medium">🟡 Orta Öncelik</SelectItem>
                        <SelectItem value="low">🔵 Düşük Öncelik</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addTask} className="gradient-primary text-white font-semibold">
                      <Plus size={18} className="sm:mr-2" />
                      <span className="hidden sm:inline">Ekle</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Task List */}
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`glass-strong rounded-xl p-3 sm:p-4 ${getPriorityColor(
                        task.priority
                      )} ${task.completed ? "opacity-60" : ""} fade-in border border-border/50`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="w-5 h-5 rounded border-2 cursor-pointer accent-primary flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm sm:text-base text-foreground ${
                              task.completed ? "line-through" : ""
                            }`}
                          >
                            {task.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(task.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="text-destructive hover:text-destructive/90 flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckSquare size={48} className="mx-auto text-muted mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Henüz görev eklemedin. Hadi başlayalım!
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Planner Tab */}
        {activeTab === "planner" && (
          <Card className="glass p-4 sm:p-6 shadow-premium fade-in border border-border/50">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center text-foreground">
                <Calendar className="mr-2 text-primary" size={20} />
                <span className="hidden sm:inline">Haftalık Planlayıcı</span>
                <span className="sm:hidden">Planlayıcı</span>
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>

            <div className="mb-4 text-center">
              <span className="text-sm sm:text-lg font-semibold text-foreground">
                {getWeekDates(weekOffset)[0].toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                })}{" "}
                -{" "}
                {getWeekDates(weekOffset)[6].toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Add Plan Form */}
            <div className="glass-strong rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-border/50">
              <div className="flex flex-col gap-3 mb-3">
                <Input
                  placeholder="Plan ekle (örn: Biyoloji tekrarı)"
                  value={planInput}
                  onChange={(e) => setPlanInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addPlan()}
                  className="bg-background"
                />
                <Select value={planDay.toString()} onValueChange={(value) => setPlanDay(parseInt(value))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    {dayNamesFull.map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addPlan} className="w-full gradient-primary text-white font-semibold">
                <Plus size={18} className="mr-2" />
                Plan Ekle
              </Button>
            </div>

            {/* Weekly Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {getWeekDates(weekOffset).map((date, index) => {
                const dateKey = date.toISOString().split("T")[0];
                const plans = weeklyPlans[dateKey] || [];
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={dateKey}
                    className={`glass-strong rounded-xl p-3 sm:p-4 border ${
                      isToday ? "ring-2 ring-primary border-primary/50" : "border-border/50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground">
                        <span className="hidden sm:inline">{dayNamesFull[index]}</span>
                        <span className="sm:hidden">{dayNames[date.getDay()]}</span>
                      </h3>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          className="bg-primary/10 p-2 rounded-lg text-xs sm:text-sm"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-foreground flex-1 break-words">{plan.text}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
                              onClick={() => deletePlan(dateKey, plan.id)}
                            >
                              <X size={12} className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {plans.length === 0 && (
                        <p className="text-muted-foreground text-xs sm:text-sm italic">Plan yok</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Habits Tab */}
        {activeTab === "habits" && (
          <Card className="glass p-4 sm:p-6 shadow-premium fade-in border border-border/50">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center text-foreground">
              <CheckCircle2 className="mr-2 text-primary" size={20} />
              Alışkanlık Takibi
            </h2>

            {/* Add Habit Form */}
            <div className="glass-strong rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-border/50">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Yeni alışkanlık ekle (örn: Her gün 1 saat matematik)"
                  value={habitInput}
                  onChange={(e) => setHabitInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addHabit()}
                  className="flex-1 bg-background"
                />
                <Button onClick={addHabit} className="gradient-primary text-white font-semibold">
                  <Plus size={18} className="mr-2" />
                  Ekle
                </Button>
              </div>
            </div>

            {/* Habits List */}
            {habits.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="glass-strong rounded-xl p-3 sm:p-4 border border-border/50 fade-in"
                  >
                    <div className="flex justify-between items-center mb-3 gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground flex-1 break-words">{habit.text}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteHabit(habit.id)}
                        className="text-destructive hover:text-destructive/90 flex-shrink-0 h-8 w-8"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {last7Days.map((date) => {
                        const dateKey = date.toISOString().split("T")[0];
                        const isCompleted = habit.completedDays.includes(dateKey);
                        const isToday =
                          date.toDateString() === new Date().toDateString();

                        return (
                          <button
                            key={dateKey}
                            onClick={() => toggleHabitDay(habit.id, dateKey)}
                            className={`aspect-square rounded-lg p-1 sm:p-2 transition-all text-xs ${
                              isCompleted
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "bg-muted hover:bg-muted/70 text-muted-foreground"
                            } ${isToday ? "ring-2 ring-accent" : ""}`}
                          >
                            <div className="font-medium text-[10px] sm:text-xs">
                              {dayNames[date.getDay()]}
                            </div>
                            <div className="text-[10px] sm:text-xs">{date.getDate()}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 size={48} className="mx-auto text-muted mb-4" />
                <p className="text-muted-foreground text-sm">
                  Henüz alışkanlık eklemedin. İlk alışkanlığını oluştur!
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Mood Tab */}
        {activeTab === "mood" && (
          <Card className="glass p-4 sm:p-6 shadow-premium fade-in border border-border/50">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center text-foreground">
              <Smile className="mr-2 text-primary" size={20} />
              Bugün Nasıl Hissediyorsun?
            </h2>

            {/* Mood Selector */}
            <div className="glass-strong rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-border/50">
              <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood as Mood)}
                    className={`p-2 sm:p-4 rounded-xl transition-all ${
                      selectedMood === mood
                        ? "bg-primary text-primary-foreground scale-105 sm:scale-110 shadow-lg"
                        : "bg-muted hover:bg-muted/70"
                    }`}
                  >
                    <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">{moodEmojis[mood - 1]}</div>
                    <div className="text-[10px] sm:text-xs text-foreground">{moodLabels[mood - 1]}</div>
                  </button>
                ))}
              </div>

              <Input
                placeholder="Notlar (opsiyonel)"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                className="mb-4 bg-background"
              />

              <Button onClick={saveMood} className="w-full gradient-primary text-white font-semibold">
                Kaydet
              </Button>
            </div>

            {/* Mood History */}
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Ruh Hali Geçmişi</h3>
            {moodHistory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {moodHistory.slice(0, 12).map((entry, index) => (
                  <div
                    key={index}
                    className="glass-strong rounded-xl p-3 sm:p-4 border border-border/50 fade-in"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl sm:text-4xl">{moodEmojis[entry.mood - 1]}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <p className="font-medium text-sm sm:text-base text-foreground">{moodLabels[entry.mood - 1]}</p>
                    {entry.note && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                        {entry.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Smile size={48} className="mx-auto text-muted mb-4" />
                <p className="text-muted-foreground text-sm">
                  Henüz ruh hali kaydın yok. İlk kaydını oluştur!
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 fade-in">
            <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Toplam Puan</h3>
                <Star className="text-amber-500 fill-amber-500" size={20} />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-primary">{points}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Harika gidiyorsun!
              </p>
            </Card>

            <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Pomodoro</h3>
                <Clock className="text-primary" size={20} />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-primary">{pomodoroCount}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                {totalStudyMinutes} dakika çalışma
              </p>
            </Card>

            <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Görevler</h3>
                <CheckSquare className="text-primary" size={20} />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-primary">
                {completedTasks}/{tasks.length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Tamamlandı</p>
            </Card>

            <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Alışkanlıklar</h3>
                <CheckCircle2 className="text-primary" size={20} />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-primary">{habits.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Aktif alışkanlık
              </p>
            </Card>

            <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Seri</h3>
                <CheckCircle2 className="text-primary" size={20} />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-primary">{currentStreak}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Gün üst üste</p>
            </Card>

            <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Ruh Hali</h3>
                <Smile className="text-primary" size={20} />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-primary">
                {moodHistory.length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Kayıt</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
