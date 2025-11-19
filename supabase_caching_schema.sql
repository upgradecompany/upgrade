-- UpGrade Caching System Schema
-- This creates tables to track user searches and cache eBay data

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS top_opportunities CASCADE;
DROP TABLE IF EXISTS card_cache CASCADE;
DROP TABLE IF EXISTS searched_cards CASCADE;

-- Track every card that users search for
CREATE TABLE searched_cards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL UNIQUE,
  search_count INTEGER DEFAULT 1,
  first_searched_at TIMESTAMPTZ DEFAULT NOW(),
  last_searched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_searched_cards_query ON searched_cards(query);
CREATE INDEX idx_searched_cards_count ON searched_cards(search_count DESC);
CREATE INDEX idx_searched_cards_last_searched ON searched_cards(last_searched_at DESC);

-- Cache individual card data from eBay API
CREATE TABLE card_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL UNIQUE,
  raw_price DECIMAL,
  psa10_price DECIMAL,
  profit_margin DECIMAL, -- psa10_price - raw_price - grading_cost
  roi_percentage DECIMAL, -- (profit_margin / raw_price) * 100
  grading_cost DECIMAL DEFAULT 100,
  image_url TEXT,
  raw_sales_history JSONB, -- Array of {date, price, platform, id, title}
  psa10_sales_history JSONB, -- Array of {date, price, platform, id, title}
  raw_results JSONB, -- Current listings for raw cards
  psa10_results JSONB, -- Current listings for PSA 10
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_card_cache_query ON card_cache(query);
CREATE INDEX idx_card_cache_expires ON card_cache(expires_at);
CREATE INDEX idx_card_cache_profit ON card_cache(profit_margin DESC);
CREATE INDEX idx_card_cache_roi ON card_cache(roi_percentage DESC);
CREATE INDEX idx_card_cache_raw_price ON card_cache(raw_price);

-- Store the daily top 20 opportunities for each price category
CREATE TABLE top_opportunities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_category TEXT NOT NULL, -- 'under50', 'under200', 'under500', 'under2000', 'over2000'
  rank INTEGER NOT NULL,
  query TEXT NOT NULL,
  card_name TEXT,
  card_year TEXT,
  card_brand TEXT,
  sport TEXT,
  raw_price DECIMAL,
  psa10_price DECIMAL,
  profit_margin DECIMAL,
  roi_percentage DECIMAL,
  grading_cost DECIMAL DEFAULT 100,
  image_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(price_category, rank, generated_at)
);

-- Create indexes for faster queries
CREATE INDEX idx_top_opportunities_category ON top_opportunities(price_category);
CREATE INDEX idx_top_opportunities_rank ON top_opportunities(rank);
CREATE INDEX idx_top_opportunities_generated ON top_opportunities(generated_at DESC);

-- Function to automatically update search count
CREATE OR REPLACE FUNCTION increment_search_count()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO searched_cards (query, search_count, last_searched_at)
  VALUES (NEW.query, 1, NOW())
  ON CONFLICT (query)
  DO UPDATE SET
    search_count = searched_cards.search_count + 1,
    last_searched_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track searches when cards are cached
CREATE TRIGGER track_card_searches
  AFTER INSERT ON card_cache
  FOR EACH ROW
  EXECUTE FUNCTION increment_search_count();

-- Enable Row Level Security
ALTER TABLE searched_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_opportunities ENABLE ROW LEVEL SECURITY;

-- Policies: Allow read access to all authenticated users
CREATE POLICY "Allow read access to searched_cards"
  ON searched_cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to card_cache"
  ON card_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to top_opportunities"
  ON top_opportunities FOR SELECT
  TO authenticated
  USING (true);

-- Policies: Allow public read for anon users too (for public-facing lists)
CREATE POLICY "Allow anon read to card_cache"
  ON card_cache FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read to top_opportunities"
  ON top_opportunities FOR SELECT
  TO anon
  USING (true);

-- Service role has full access (for API routes and cron jobs)
CREATE POLICY "Service role full access to searched_cards"
  ON searched_cards FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role full access to card_cache"
  ON card_cache FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role full access to top_opportunities"
  ON top_opportunities FOR ALL
  TO service_role
  USING (true);

-- Helper function to get fresh cache (not expired)
CREATE OR REPLACE FUNCTION get_fresh_card_cache(search_query TEXT)
RETURNS TABLE (
  query TEXT,
  raw_price DECIMAL,
  psa10_price DECIMAL,
  profit_margin DECIMAL,
  roi_percentage DECIMAL,
  image_url TEXT,
  raw_sales_history JSONB,
  psa10_sales_history JSONB,
  raw_results JSONB,
  psa10_results JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    card_cache.query,
    card_cache.raw_price,
    card_cache.psa10_price,
    card_cache.profit_margin,
    card_cache.roi_percentage,
    card_cache.image_url,
    card_cache.raw_sales_history,
    card_cache.psa10_sales_history,
    card_cache.raw_results,
    card_cache.psa10_results
  FROM card_cache
  WHERE card_cache.query = search_query
    AND card_cache.expires_at > NOW()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get top cards by category (most recent generation)
CREATE OR REPLACE FUNCTION get_top_cards_by_category(category TEXT)
RETURNS TABLE (
  rank INTEGER,
  query TEXT,
  card_name TEXT,
  card_year TEXT,
  card_brand TEXT,
  sport TEXT,
  raw_price DECIMAL,
  psa10_price DECIMAL,
  profit_margin DECIMAL,
  roi_percentage DECIMAL,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    top_opportunities.rank,
    top_opportunities.query,
    top_opportunities.card_name,
    top_opportunities.card_year,
    top_opportunities.card_brand,
    top_opportunities.sport,
    top_opportunities.raw_price,
    top_opportunities.psa10_price,
    top_opportunities.profit_margin,
    top_opportunities.roi_percentage,
    top_opportunities.image_url
  FROM top_opportunities
  WHERE top_opportunities.price_category = category
    AND top_opportunities.generated_at = (
      SELECT MAX(generated_at)
      FROM top_opportunities
      WHERE price_category = category
    )
  ORDER BY top_opportunities.rank ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Create comments for documentation
COMMENT ON TABLE searched_cards IS 'Tracks all cards users have searched for, with search frequency';
COMMENT ON TABLE card_cache IS 'Caches eBay API data for individual cards to reduce API calls';
COMMENT ON TABLE top_opportunities IS 'Stores daily top 20 cards per price category';
COMMENT ON FUNCTION get_fresh_card_cache IS 'Returns cached card data only if not expired';
COMMENT ON FUNCTION get_top_cards_by_category IS 'Returns the most recent top 20 cards for a given price category';
