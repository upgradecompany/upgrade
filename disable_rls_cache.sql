-- Disable Row Level Security on cache tables
-- These are system tables, not user-specific data

ALTER TABLE card_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE searched_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE top_opportunities DISABLE ROW LEVEL SECURITY;
