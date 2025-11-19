-- UpGrade Database Schema for Supabase
-- Run this in Supabase SQL Editor to create all necessary tables

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  signup_date TIMESTAMPTZ DEFAULT NOW(),
  trial_end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- WATCHLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  card_id TEXT NOT NULL,
  card_data JSONB NOT NULL,
  added_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Enable Row Level Security
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own watchlist
CREATE POLICY "Users can view own watchlist"
  ON public.watchlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert to their own watchlist
CREATE POLICY "Users can add to own watchlist"
  ON public.watchlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete from their own watchlist
CREATE POLICY "Users can remove from own watchlist"
  ON public.watchlist
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PORTFOLIO TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  card_id TEXT NOT NULL,
  card_data JSONB NOT NULL,
  quantity INTEGER DEFAULT 1,
  purchase_price DECIMAL(10, 2) DEFAULT 0,
  added_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Enable Row Level Security
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own portfolio
CREATE POLICY "Users can view own portfolio"
  ON public.portfolio
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert to their own portfolio
CREATE POLICY "Users can add to own portfolio"
  ON public.portfolio
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own portfolio
CREATE POLICY "Users can update own portfolio"
  ON public.portfolio
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete from their own portfolio
CREATE POLICY "Users can remove from own portfolio"
  ON public.portfolio
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON public.portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database schema created successfully! ✅' AS message;
