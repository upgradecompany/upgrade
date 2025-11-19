# UpGrade Caching System Setup Guide

## Overview

This caching system reduces eBay API calls by ~90-95% and enables automatic discovery of the best card opportunities.

**Key Features:**
- Caches individual card searches for 12 hours
- Tracks user search behavior automatically
- Daily scan finds top 20 cards in each price category
- Fully automated - no manual curation needed
- Supports 1000+ users within 5,000 daily API limit

---

## Step 1: Create Database Tables

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Go to your project: `albfrsnatytpsqihiufb`
3. Click **SQL Editor** in the left sidebar
4. Create a **New Query**
5. Copy the entire contents of `supabase_caching_schema.sql` into the query editor
6. Click **Run** to execute the SQL

This creates 3 tables:
- `searched_cards` - Tracks all user searches
- `card_cache` - Caches eBay data for 12 hours
- `top_opportunities` - Stores daily top 20 per price category

---

## Step 2: Test the Caching System

The caching system is already integrated into your existing API routes.

### Test Individual Card Caching

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Search for a card in your app (e.g., "Michael Jordan 1986")

3. First search:
   - Will hit eBay API (cache miss)
   - Data gets saved to `card_cache` table
   - Console shows: `"Cache miss for: michael jordan 1986 - fetching from eBay"`

4. Search again within 12 hours:
   - Will return cached data (no API call)
   - Console shows: `"Cache hit for: michael jordan 1986"`

5. Check Supabase:
   - Go to **Table Editor** > `card_cache`
   - You should see your searched card with cached data

---

## Step 3: Run the Daily Top Cards Scanner

The daily scanner finds the top 20 best profit opportunities in each price category.

### Manual Test Run

1. Trigger the cron job manually by visiting this URL in your browser:
   ```
   http://localhost:3000/api/cron/update-top-cards
   ```

2. Wait 30-60 seconds for it to complete

3. You'll see a JSON response like:
   ```json
   {
     "success": true,
     "cardsScanned": 50,
     "apiCalls": 10,
     "cacheHits": 40,
     "topCardsGenerated": 100,
     "breakdown": {
       "under50": 15,
       "under200": 20,
       "under500": 10,
       "under2000": 3,
       "over2000": 2
     }
   }
   ```

4. Check Supabase:
   - Go to **Table Editor** > `top_opportunities`
   - You should see up to 100 cards (20 per category)

### How It Works

1. Fetches all user-searched cards from `searched_cards` table
2. For each card, checks cache first (if cached, no API call)
3. If not cached, calls eBay API and caches result
4. Calculates profit margins for all cards
5. Groups by price category (`under50`, `under200`, `under500`, `under2000`, `over2000`)
6. Saves top 20 per category to `top_opportunities` table

---

## Step 4: Set Up Automated Daily Cron Job

You have two options:

### Option A: Vercel Cron (Recommended for Production)

1. Create a file `vercel.json` in your project root:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/update-top-cards",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. Vercel will automatically call your cron endpoint every day at 2 AM UTC

### Option B: External Cron Service (Alternative)

Use a service like cron-job.org or EasyCron:

1. Sign up at https://cron-job.org
2. Create a new cron job
3. Set URL to: `https://yourdomain.com/api/cron/update-top-cards`
4. Set schedule to: Daily at 2:00 AM
5. Save and enable

---

## Step 5: Update List Page to Use Cached Data

The list page (`/app/list/page.js`) currently uses mock data. Once the cron job has run at least once, you can update it to fetch real data from the API.

### Test the Top Cards API

Visit in your browser (after running the cron job):
```
http://localhost:3000/api/top-cards?category=under50
http://localhost:3000/api/top-cards?category=under200
http://localhost:3000/api/top-cards?category=all
```

You should see real card data with profit margins!

---

## API Usage Estimates

### Without Caching (Old System)
- 1000 users × 5 card views each = 5,000 views/day
- 5,000 views × 2 API calls = 10,000 API calls
- **Result: Exceeds 5,000 limit on day 1**

### With Caching (New System)
- Daily cron: 200 cards, 90% cached = 20 API calls
- User searches: 1,000 searches, 80% cached = 200 API calls
- **Total: ~220 API calls/day (96% reduction!)**
- **Result: Can support 10,000+ users**

---

## Monitoring & Maintenance

### Check Cache Hit Rate

1. Go to Supabase **SQL Editor**
2. Run this query:
   ```sql
   SELECT
     COUNT(*) as total_cached_cards,
     AVG(search_count) as avg_searches_per_card
   FROM searched_cards;
   ```

### View Top Opportunities

```sql
SELECT
  price_category,
  COUNT(*) as card_count,
  MAX(generated_at) as last_updated
FROM top_opportunities
GROUP BY price_category;
```

### Clear Old Cache (Manual)

```sql
-- Delete cache older than 7 days
DELETE FROM card_cache
WHERE cached_at < NOW() - INTERVAL '7 days';

-- Delete old top opportunities (keeps last 7 days)
DELETE FROM top_opportunities
WHERE generated_at < NOW() - INTERVAL '7 days';
```

---

## Troubleshooting

### "No top cards found"
- Make sure you've run the cron job at least once
- Check Supabase `top_opportunities` table for data

### "Cache not working"
- Check Supabase connection in API routes
- Verify `card_cache` table exists
- Check browser console for errors

### "API still hitting rate limits"
- Check how many searches are being made per day
- Verify cache is working (check console logs)
- Consider increasing cache expiry from 12h to 24h

---

## Next Steps

1. ✅ Run SQL schema in Supabase
2. ✅ Test caching by searching for cards
3. ✅ Manually run cron job
4. ✅ Verify data in Supabase tables
5. ⏳ Set up automated daily cron
6. ⏳ Update list page to use real data
7. ⏳ Deploy to production

---

## Need Help?

- Check Supabase logs: Dashboard > Logs
- Check Next.js console: Look for cache hit/miss messages
- Check eBay API status: developer.ebay.com
