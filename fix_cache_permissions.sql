-- Fix: Allow API routes to insert/update cache data
-- The API routes run as 'anon' role, not authenticated users

-- Allow anon to insert into card_cache
CREATE POLICY "Allow anon insert to card_cache"
  ON card_cache FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon to update card_cache
CREATE POLICY "Allow anon update to card_cache"
  ON card_cache FOR UPDATE
  TO anon
  USING (true);

-- Allow anon to insert into searched_cards
CREATE POLICY "Allow anon insert to searched_cards"
  ON searched_cards FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon to update searched_cards
CREATE POLICY "Allow anon update to searched_cards"
  ON searched_cards FOR UPDATE
  TO anon
  USING (true);

-- Allow anon to insert into top_opportunities
CREATE POLICY "Allow anon insert to top_opportunities"
  ON top_opportunities FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon to delete from top_opportunities (for cron cleanup)
CREATE POLICY "Allow anon delete from top_opportunities"
  ON top_opportunities FOR DELETE
  TO anon
  USING (true);
