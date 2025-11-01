export interface Quest {
  id: string;
  name: string;
  description: string;
  xp: number;
  icon: string;
  completed: boolean;
  progress?: number;
  target?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Habit {
  id: string;
  name: string;
  xp: number;
  completedDates: string[];
  streak: number;
}

export interface Todo {
  id: number;
  text: string;
  deadline: string | null;
  completed: boolean;
}

export interface Medication {
  id: number;
  name: string;
  time: string;
  takenToday: boolean;
}

export interface JournalEntry {
  date: string;
  mood: string;
  energy: number;
  sleep: number | null;
  notes: string;
}

export interface FocusSessions {
  today: number;
  week: number;
  total: number;
  totalMinutes: number;
}

export interface SubjectPerformance {
  name: string;
  correct: number;
  wrong: number;
  empty: number;
  successRate: number;
}

export interface StudyTimeLog {
  hour: number;
  productivity: number;
  date: string;
}

export interface ExamResult {
  date: string;
  totalNet: number;
  subjects: {
    name: string;
    net: number;
  }[];
}

export interface Stats {
  discipline: number;
  focus: number;
  energy: number;
  knowledge: number;
}

export interface GameState {
  level: number;
  currentXP: number;
  totalXP: number;
  stats: Stats;
  skillPoints: number;
  streak: number;
  longestStreak: number;
  completedQuests: number;
  achievements: Achievement[];
  habits: Habit[];
  todos: Todo[];
  medications: Medication[];
  lastLogin: string | null;
  firstLogin: string | null;
  lastDailyReward: string | null;
  lastReset: string | null;
  focusSessions: FocusSessions;
  quests: {
    daily: Quest[];
    weekly: Quest[];
    special: Quest[];
  };
  xpHistory: { date: string; xp: number }[];
  journalEntries: JournalEntry[];
  subjectPerformances: SubjectPerformance[];
  studyTimeLogs: StudyTimeLog[];
  examResults: ExamResult[];
}
