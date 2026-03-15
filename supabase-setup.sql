-- Create recipes table (idempotent)
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  ingredients JSONB,
  steps JSONB,
  ratings_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table (idempotent)
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, ip_hash) -- Prevent multiple ratings from same IP
);

-- Create indexes for better performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_recipe_id ON ratings(recipe_id);

-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to recipes and ratings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'recipes' AND policyname = 'Public read access for recipes') THEN
        CREATE POLICY "Public read access for recipes" ON recipes FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ratings' AND policyname = 'Public read access for ratings') THEN
        CREATE POLICY "Public read access for ratings" ON ratings FOR SELECT USING (true);
    END IF;
END $$;

-- Ensure `user_id` exists (added for logged-in recipe ownership)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id UUID;

-- Allow public insert for recipes (for sharing)
-- Anonymous users can insert when user_id is null; authenticated users can insert when user_id matches their auth uid
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'recipes' AND policyname = 'Public insert access for recipes') THEN
        CREATE POLICY "Public insert access for recipes" ON recipes FOR INSERT WITH CHECK (
          (auth.uid() IS NULL AND user_id IS NULL) OR
          (auth.uid() = user_id)
        );
    END IF;
END $$;

-- Allow public insert for ratings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ratings' AND policyname = 'Public insert access for ratings') THEN
        CREATE POLICY "Public insert access for ratings" ON ratings FOR INSERT WITH CHECK (true);
    END IF;
END $$;