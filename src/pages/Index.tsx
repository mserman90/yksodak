import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
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
  X,
  LogOut,
  Gamepad2
} from "lucide-react";
import { UserGuide } from "@/components/UserGuide";

type Tab = "pomodoro" | "tasks" | "planner" | "habits" | "mood" | "stats";
type Priority = "high" | "medium" | "low";
type Mood = 1 | 2 | 3 | 4 | 5;

interface Task {
  id: string;
  text: string;
  priority: Priority;
  completed: boolean;
  created_at: string;
}

interface Plan {
  id: string;
  text: string;
  date: string;
}

interface Habit {
  id: string;
  name: string;
  days: Record<string, boolean>;
  created_at: string;
}

interface MoodEntry {
  id?: string;
  date: string;
  mood: string;
  note?: string;
}

interface UserStats {
  points: number;
  pomodoro_count: number;
  study_minutes: number;
  work_duration: number;
  short_break: number;
  long_break: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pomodoro");
  const [darkMode, setDarkMode] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    points: 0,
    pomodoro_count: 0,
    study_minutes: 0,
    work_duration: 25,
    short_break: 5,
    long_break: 15,
  });
  const { toast } = useToast();

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Pomodoro state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");

  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyPlans, setWeeklyPlans] = useState<Record<string, Plan[]>>({});
  const [planInput, setPlanInput] = useState("");
  const [planDay, setPlanDay] = useState(0);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitInput, setHabitInput] = useState("");

  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodNote, setMoodNote] = useState("");

  // Load user stats and data from database
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user stats
      const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (stats) {
        setUserStats({
          points: stats.points,
          pomodoro_count: stats.pomodoro_count,
          study_minutes: stats.study_minutes,
          work_duration: stats.work_duration,
          short_break: stats.short_break,
          long_break: stats.long_break,
        });
        setTimeLeft(stats.work_duration * 60);
      }

      // Load tasks
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (tasksData) {
        setTasks(tasksData as Task[]);
      }

      // Load plans
      const { data: plansData } = await supabase
        .from("plans")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (plansData) {
        const grouped: Record<string, Plan[]> = {};
        plansData.forEach((plan) => {
          if (!grouped[plan.date]) {
            grouped[plan.date] = [];
          }
          grouped[plan.date].push(plan);
        });
        setWeeklyPlans(grouped);
      }

      // Load habits
      const { data: habitsData } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (habitsData) {
        setHabits(habitsData.map(h => ({
          ...h,
          days: h.days as Record<string, boolean>
        })));
      }

      // Load mood entries
      const { data: moodData } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (moodData) {
        setMoodHistory(moodData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Update user stats in database
  const updateUserStats = async (updates: Partial<UserStats>) => {
    if (!user) return;

    const newStats = { ...userStats, ...updates };
    setUserStats(newStats);

    try {
      await supabase
        .from("user_stats")
        .update({
          points: newStats.points,
          pomodoro_count: newStats.pomodoro_count,
          study_minutes: newStats.study_minutes,
          work_duration: newStats.work_duration,
          short_break: newStats.short_break,
          long_break: newStats.long_break,
        })
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  };

  // Dark mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const addPoints = (amount: number) => {
    const newPoints = userStats.points + amount;
    updateUserStats({ points: newPoints });
    toast({
      title: `+${amount} puan kazandın! 🌟`,
      description: `Toplam: ${newPoints} puan`,
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
    setTimeLeft(userStats.work_duration * 60);
  };

  const handleTimerComplete = () => {
    if (!isBreak) {
      const newPomodoroCount = userStats.pomodoro_count + 1;
      const newStudyMinutes = userStats.study_minutes + userStats.work_duration;
      updateUserStats({
        pomodoro_count: newPomodoroCount,
        study_minutes: newStudyMinutes,
      });
      addPoints(25);
      toast({
        title: "🎉 Harika! Bir pomodoro tamamladın!",
        description: "Mola zamanı!",
      });

      setIsBreak(true);
      const breakTime = newPomodoroCount % 4 === 0 ? userStats.long_break : userStats.short_break;
      setTimeLeft(breakTime * 60);
    } else {
      toast({
        title: "Mola bitti!",
        description: "Tekrar çalışmaya başlayabilirsin.",
      });
      setIsBreak(false);
      setTimeLeft(userStats.work_duration * 60);
    }
  };

  const getProgressPercentage = () => {
    const totalTime = isBreak
      ? (userStats.pomodoro_count % 4 === 0 ? userStats.long_break : userStats.short_break) * 60
      : userStats.work_duration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Task functions
  const addTask = async () => {
    if (!taskInput.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir görev girin",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          text: taskInput,
          priority: taskPriority,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTasks([data as Task, ...tasks]);
        setTaskInput("");
        addPoints(5);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Hata",
        description: "Görev eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: newCompleted })
        .eq("id", id);

      if (error) throw error;

      setTasks(
        tasks.map((t) => {
          if (t.id === id) {
            if (!t.completed) addPoints(10);
            return { ...t, completed: newCompleted };
          }
          return t;
        })
      );
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;

      setTasks(tasks.filter((t) => t.id !== id));
      toast({ title: "Görev silindi" });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
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

  const addPlan = async () => {
    if (!planInput.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir plan girin",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    const dates = getWeekDates(weekOffset);
    const dateKey = dates[planDay].toISOString().split("T")[0];

    try {
      const { data, error } = await supabase
        .from("plans")
        .insert({
          user_id: user.id,
          text: planInput,
          date: dateKey,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setWeeklyPlans({
          ...weeklyPlans,
          [dateKey]: [...(weeklyPlans[dateKey] || []), data],
        });

        setPlanInput("");
        addPoints(5);
        toast({ title: "Plan eklendi!" });
      }
    } catch (error) {
      console.error("Error adding plan:", error);
      toast({
        title: "Hata",
        description: "Plan eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const deletePlan = async (dateKey: string, planId: string) => {
    try {
      const { error } = await supabase.from("plans").delete().eq("id", planId);

      if (error) throw error;

      setWeeklyPlans({
        ...weeklyPlans,
        [dateKey]: weeklyPlans[dateKey].filter((p) => p.id !== planId),
      });
      toast({ title: "Plan silindi" });
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  // Habit functions
  const addHabit = async () => {
    if (!habitInput.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir alışkanlık girin",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          name: habitInput,
          days: {},
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setHabits([{ ...data, days: data.days as Record<string, boolean> }, ...habits]);
        setHabitInput("");
        addPoints(5);
        toast({ title: "Alışkanlık eklendi!" });
      }
    } catch (error) {
      console.error("Error adding habit:", error);
      toast({
        title: "Hata",
        description: "Alışkanlık eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const toggleHabitDay = async (habitId: string, dateKey: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const newDays = { ...habit.days };
    const isCompleted = newDays[dateKey];

    if (isCompleted) {
      delete newDays[dateKey];
    } else {
      newDays[dateKey] = true;
      addPoints(10);
    }

    try {
      const { error } = await supabase
        .from("habits")
        .update({ days: newDays })
        .eq("id", habitId);

      if (error) throw error;

      setHabits(
        habits.map((h) => {
          if (h.id === habitId) {
            return { ...h, days: newDays };
          }
          return h;
        })
      );
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase.from("habits").delete().eq("id", id);

      if (error) throw error;

      setHabits(habits.filter((h) => h.id !== id));
      toast({ title: "Alışkanlık silindi" });
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  // Mood functions
  const saveMood = async () => {
    if (!selectedMood) {
      toast({
        title: "Hata",
        description: "Lütfen bir ruh hali seç",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const existingEntry = moodHistory.find((m) => m.date === today);

    try {
      if (existingEntry) {
        const { error } = await supabase
          .from("mood_entries")
          .update({
            mood: selectedMood.toString(),
            note: moodNote,
          })
          .eq("id", existingEntry.id);

        if (error) throw error;

        setMoodHistory(
          moodHistory.map((m) =>
            m.date === today
              ? { ...m, mood: selectedMood.toString(), note: moodNote }
              : m
          )
        );
      } else {
        const { data, error } = await supabase
          .from("mood_entries")
          .insert({
            user_id: user.id,
            mood: selectedMood.toString(),
            note: moodNote,
            date: today,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setMoodHistory([data, ...moodHistory]);
        }
      }

      addPoints(5);
      toast({ title: "Ruh halin kaydedildi!" });
      setSelectedMood(null);
      setMoodNote("");
    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Hata",
        description: "Ruh hali kaydedilirken bir hata oluştu",
        variant: "destructive",
      });
    }
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
  const currentStreak = habits.reduce((max, habit) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      if (habit.days[dateKey]) {
        streak++;
      } else {
        break;
      }
    }
    return Math.max(max, streak);
  }, 0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                <span className="font-bold text-primary text-sm sm:text-base bounce-gentle">{userStats.points}</span>
              </div>
              <Link to="/yks-quest">
                <Button
                  variant="default"
                  size="sm"
                  className="hidden sm:flex items-center gap-2"
                >
                  <Gamepad2 size={18} />
                  YKS Quest
                </Button>
              </Link>
              <UserGuide />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
                title="Çıkış Yap"
              >
                <LogOut size={18} />
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
                    value={userStats.work_duration}
                    onChange={(e) => {
                      const newDuration = parseInt(e.target.value);
                      updateUserStats({ work_duration: newDuration });
                      if (!isRunning && !isBreak) setTimeLeft(newDuration * 60);
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
                    value={userStats.short_break}
                    onChange={(e) => updateUserStats({ short_break: parseInt(e.target.value) })}
                    className="text-center text-base sm:text-lg font-semibold bg-background"
                  />
                </div>
                <div className="glass-strong rounded-xl p-3 sm:p-4 border border-border/50">
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-foreground">Uzun Mola (dk)</label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={userStats.long_break}
                    onChange={(e) => updateUserStats({ long_break: parseInt(e.target.value) })}
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
                        i < userStats.pomodoro_count % 4 ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-primary">
                  {userStats.pomodoro_count % 4}/4
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
                            {new Date(task.created_at).toLocaleDateString("tr-TR")}
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
                  <Card
                    key={dateKey}
                    className={`glass-strong p-3 sm:p-4 ${
                      isToday ? "ring-2 ring-primary" : ""
                    } border border-border/50`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-foreground">
                          {dayNames[index]}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {date.getDate()}/{date.getMonth() + 1}
                        </p>
                      </div>
                      {isToday && (
                        <span className="text-[10px] sm:text-xs bg-primary text-primary-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          Bugün
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          className="glass p-2 rounded-lg text-xs sm:text-sm flex justify-between items-start gap-2 bg-background"
                        >
                          <span className="text-foreground break-words flex-1">{plan.text}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePlan(dateKey, plan.id)}
                            className="h-5 w-5 sm:h-6 sm:w-6 text-destructive hover:text-destructive/90 flex-shrink-0"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ))}
                      {plans.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Plan yok
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

        {/* Habits Tab */}
        {activeTab === "habits" && (
          <Card className="glass p-4 sm:p-6 shadow-premium fade-in border border-border/50">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center text-foreground">
              <CheckCircle2 className="mr-2 text-primary" size={20} />
              Alışkanlık Takibi
            </h2>

            {/* Add Habit Form */}
            <div className="glass-strong rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-border/50">
              <div className="flex gap-3">
                <Input
                  placeholder="Yeni alışkanlık ekle (örn: Sabah sporou)"
                  value={habitInput}
                  onChange={(e) => setHabitInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addHabit()}
                  className="bg-background"
                />
                <Button onClick={addHabit} className="gradient-primary text-white font-semibold">
                  <Plus size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">Ekle</span>
                </Button>
              </div>
            </div>

            {/* Habits Grid */}
            {habits.length > 0 ? (
              <div className="space-y-4">
                {habits.map((habit) => (
                  <div key={habit.id} className="glass-strong rounded-xl p-3 sm:p-4 border border-border/50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-sm sm:text-base text-foreground">{habit.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteHabit(habit.id)}
                        className="text-destructive hover:text-destructive/90 h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>

                    <div className="flex gap-1 sm:gap-2 justify-between">
                      {last7Days.map((date) => {
                        const dateKey = date.toISOString().split("T")[0];
                        const isCompleted = habit.days[dateKey];
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                          <button
                            key={dateKey}
                            onClick={() => toggleHabitDay(habit.id, dateKey)}
                            className={`flex-1 aspect-square rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                              isCompleted
                                ? "bg-primary text-primary-foreground shadow-md scale-105"
                                : "glass hover:bg-accent"
                            } ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}`}
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              <div className="text-[8px] sm:text-xs">{dayNames[date.getDay()]}</div>
                              <div className="font-bold">{date.getDate()}</div>
                            </div>
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
                  Henüz alışkanlık eklemedin. Hadi başlayalım!
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
              Ruh Halim
            </h2>

            {/* Mood Selector */}
            <div className="glass-strong rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-border/50">
              <h3 className="font-semibold mb-4 text-center text-sm sm:text-base text-foreground">
                Bugün nasıl hissediyorsun?
              </h3>
              <div className="flex justify-between gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood as Mood)}
                    className={`flex-1 p-3 sm:p-4 rounded-xl transition-all ${
                      selectedMood === mood
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "glass hover:scale-105"
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">{moodEmojis[mood - 1]}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-center">
                      {moodLabels[mood - 1]}
                    </div>
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
                <Star className="mr-2" size={18} />
                Kaydet
              </Button>
            </div>

            {/* Mood History */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm sm:text-base text-foreground">Ruh Hali Geçmişi</h3>
              {moodHistory.length > 0 ? (
                moodHistory.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id || entry.date}
                    className="glass-strong rounded-xl p-3 sm:p-4 flex items-start gap-3 border border-border/50"
                  >
                    <div className="text-2xl sm:text-3xl">{moodEmojis[parseInt(entry.mood) - 1]}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-xs sm:text-sm text-foreground">
                          {new Date(entry.date).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {moodLabels[parseInt(entry.mood) - 1]}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Smile size={48} className="mx-auto text-muted mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Henüz ruh hali kaydı yok. İlk kaydını oluştur!
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <Star className="text-amber-500 fill-amber-500" size={24} />
                  <span className="text-3xl sm:text-4xl font-bold text-primary">{userStats.points}</span>
                </div>
                <h3 className="font-semibold text-foreground">Toplam Puan</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Şimdiye kadar kazandığın puanlar</p>
              </Card>

              <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="text-primary" size={24} />
                  <span className="text-3xl sm:text-4xl font-bold text-primary">{userStats.pomodoro_count}</span>
                </div>
                <h3 className="font-semibold text-foreground">Pomodoro</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {userStats.study_minutes} dakika çalıştın
                </p>
              </Card>

              <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <CheckSquare className="text-success" size={24} />
                  <span className="text-3xl sm:text-4xl font-bold text-primary">
                    {completedTasks}/{tasks.length}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">Görevler</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Tamamlanan / Toplam</p>
              </Card>

              <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle2 className="text-primary" size={24} />
                  <span className="text-3xl sm:text-4xl font-bold text-primary">{habits.length}</span>
                </div>
                <h3 className="font-semibold text-foreground">Alışkanlıklar</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Takip edilen alışkanlık sayısı</p>
              </Card>

              <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <Star className="text-amber-500" size={24} />
                  <span className="text-3xl sm:text-4xl font-bold text-primary">{currentStreak}</span>
                </div>
                <h3 className="font-semibold text-foreground">Streak</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Günlük alışkanlık serisi</p>
              </Card>

              <Card className="glass p-4 sm:p-6 shadow-premium border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <Smile className="text-primary" size={24} />
                  <span className="text-3xl sm:text-4xl font-bold text-primary">{moodHistory.length}</span>
                </div>
                <h3 className="font-semibold text-foreground">Ruh Hali</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Kayıtlı ruh hali girişi</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;