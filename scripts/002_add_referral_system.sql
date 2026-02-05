-- Add referral/recruitment system columns to profiles table
-- This enables hierarchical team structure tracking

-- Add new columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Agent',
ADD COLUMN IF NOT EXISTS team_name TEXT;

-- Create index for faster referral lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Update the handle_new_user function to generate referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_referral_code TEXT;
  referrer_id UUID;
BEGIN
  -- Generate unique referral code
  LOOP
    new_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_referral_code);
  END LOOP;
  
  -- Check if there's a referral code in metadata
  IF NEW.raw_user_meta_data ? 'referred_by_code' THEN
    SELECT id INTO referrer_id 
    FROM public.profiles 
    WHERE referral_code = NEW.raw_user_meta_data ->> 'referred_by_code';
  END IF;
  
  INSERT INTO public.profiles (id, first_name, last_name, email, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    NEW.email,
    new_referral_code,
    referrer_id
  )
  ON CONFLICT (id) DO UPDATE SET
    referral_code = COALESCE(public.profiles.referral_code, EXCLUDED.referral_code),
    referred_by = COALESCE(public.profiles.referred_by, EXCLUDED.referred_by);
  
  RETURN NEW;
END;
$$;

-- Generate referral codes for existing users who don't have one
DO $$
DECLARE
  profile_record RECORD;
  new_code TEXT;
BEGIN
  FOR profile_record IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    LOOP
      new_code := generate_referral_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code);
    END LOOP;
    UPDATE public.profiles SET referral_code = new_code WHERE id = profile_record.id;
  END LOOP;
END;
$$;

-- Function to get the upline (ancestors) of a user
CREATE OR REPLACE FUNCTION get_upline(user_id UUID, max_depth INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  title TEXT,
  avatar_url TEXT,
  depth INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE upline AS (
    -- Base case: get the direct referrer
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.title,
      p.avatar_url,
      1 as depth
    FROM public.profiles p
    WHERE p.id = (SELECT referred_by FROM public.profiles WHERE profiles.id = user_id)
    
    UNION ALL
    
    -- Recursive case: get the referrer's referrer
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.title,
      p.avatar_url,
      u.depth + 1
    FROM public.profiles p
    INNER JOIN upline u ON p.id = (SELECT referred_by FROM public.profiles WHERE profiles.id = u.id)
    WHERE u.depth < max_depth
  )
  SELECT * FROM upline ORDER BY depth;
END;
$$;

-- Function to get the downline (descendants) of a user
CREATE OR REPLACE FUNCTION get_downline(user_id UUID, max_depth INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  title TEXT,
  avatar_url TEXT,
  referred_by UUID,
  depth INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE downline AS (
    -- Base case: get direct recruits
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.title,
      p.avatar_url,
      p.referred_by,
      1 as depth
    FROM public.profiles p
    WHERE p.referred_by = user_id
    
    UNION ALL
    
    -- Recursive case: get recruits' recruits
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.title,
      p.avatar_url,
      p.referred_by,
      d.depth + 1
    FROM public.profiles p
    INNER JOIN downline d ON p.referred_by = d.id
    WHERE d.depth < max_depth
  )
  SELECT * FROM downline ORDER BY depth, first_name;
END;
$$;

-- Function to get team statistics
CREATE OR REPLACE FUNCTION get_team_stats(user_id UUID)
RETURNS TABLE (
  direct_recruits BIGINT,
  total_team_size BIGINT,
  team_depth INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE team AS (
    SELECT p.id, 1 as depth
    FROM public.profiles p
    WHERE p.referred_by = user_id
    
    UNION ALL
    
    SELECT p.id, t.depth + 1
    FROM public.profiles p
    INNER JOIN team t ON p.referred_by = t.id
    WHERE t.depth < 20
  )
  SELECT 
    (SELECT COUNT(*) FROM public.profiles WHERE referred_by = user_id) as direct_recruits,
    (SELECT COUNT(*) FROM team) as total_team_size,
    COALESCE((SELECT MAX(depth) FROM team), 0) as team_depth;
END;
$$;
