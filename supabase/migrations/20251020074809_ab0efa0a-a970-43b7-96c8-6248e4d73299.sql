-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT tasks_text_length CHECK (length(text) <= 500)
);

-- Create habits table
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  days JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT habits_name_length CHECK (length(name) <= 200)
);

-- Create mood_entries table
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT mood_entries_note_length CHECK (length(note) <= 1000)
);

-- Create plans table
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT plans_text_length CHECK (length(text) <= 500)
);

-- Create user_stats table
CREATE TABLE public.user_stats (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0,
  pomodoro_count INTEGER NOT NULL DEFAULT 0,
  study_minutes INTEGER NOT NULL DEFAULT 0,
  work_duration INTEGER NOT NULL DEFAULT 25,
  short_break INTEGER NOT NULL DEFAULT 5,
  long_break INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits"
  ON public.habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON public.habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON public.habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON public.habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for mood_entries
CREATE POLICY "Users can view their own mood entries"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON public.mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON public.mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plans
CREATE POLICY "Users can view their own plans"
  ON public.plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
  ON public.plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON public.plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON public.plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_stats
CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to initialize user stats
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger to initialize user stats on signup
CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_stats();

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX idx_mood_entries_date ON public.mood_entries(date);
CREATE INDEX idx_plans_user_id ON public.plans(user_id);
CREATE INDEX idx_plans_date ON public.plans(date);