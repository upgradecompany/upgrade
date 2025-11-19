# Real Data Sources for UpGrade

This document outlines options for obtaining real sports card pricing data for UpGrade.

## Recommended Approach (Most Cost-Effective + Accurate)

### 1. eBay API (Official)
**Cost:** Free tier available, then $0.10-$0.50 per call
**Accuracy:** High (real sold listings)
**Setup:** Requires eBay Developer Account

**Pros:**
- Official API with reliable data
- Access to sold listings (actual market prices)
- Free tier for development
- Legal and terms-compliant

**Cons:**
- Can get expensive at scale
- Learning curve for API
- Rate limits

**How to get started:**
1. Sign up at https://developer.ebay.com/
2. Create an app to get API keys
3. Use the "Finding API" or "Buy API" for completed listings
4. Filter by: card condition, PSA grade, player name, year

**Example endpoint:**
```
https://svcs.ebay.com/services/search/FindingService/v1?
  OPERATION-NAME=findCompletedItems
  &keywords=Tom+Brady+2000+Topps+Chrome+PSA+10
```

---

### 2. TCGPlayer API (Trading Card Games)
**Cost:** Free for partners
**Accuracy:** High
**Best for:** Pokemon, Magic, YuGiOh (not sports cards)

**Note:** TCGPlayer focuses on trading card games, not sports cards. Skip this for UpGrade.

---

### 3. CardLadder (Subscription Service)
**Cost:** $19.99/month for data access
**Accuracy:** Very High (aggregated from multiple sources)
**Website:** https://www.cardladder.com/

**Pros:**
- Pre-aggregated data from eBay, PWCC, Goldin, etc.
- Already has PSA pop reports integrated
- Clean API
- Covers most major sports cards

**Cons:**
- Monthly subscription cost
- Still requires API integration work

**Best for:** Production-ready app with paying customers

---

### 4. Free Alternative: Web Scraping (Use with Caution)
**Cost:** Free (but requires development time)
**Accuracy:** Medium-High
**Legal:** Gray area - may violate Terms of Service

**Option A: eBay Sold Listings (Scraping)**
- Use a library like Puppeteer or Playwright to scrape eBay
- Search for completed listings
- Extract pricing data
- **WARNING:** Violates eBay TOS, they may ban your IP

**Option B: 130point.com**
- Sports card tracking site with pricing trends
- Easier to scrape than eBay
- Still may violate TOS

**Option C: PSA Pop Report (Free)**
- Get PSA 10 population counts for free
- URL: https://www.psacard.com/pop
- Can be scraped or manually referenced
- This is legal and free for population data only

---

## Hybrid Approach (Recommended for MVP)

### Phase 1: Launch with Free Data
1. Use PSA Pop Report for population counts (free, scrapeable)
2. Use eBay's public search (manual scraping, use sparingly during development)
3. Manually curate pricing for top 50-100 most searched cards

### Phase 2: Scale with Paid Services
Once you have paying users:
1. Integrate eBay API ($0.10-$0.50 per search)
2. Subscribe to CardLadder ($19.99/month) for comprehensive data
3. Use API calls only when users actually search (don't pre-fetch everything)

---

## Implementation Priority

**For Launch (Next 2-4 weeks):**
1. ✅ Keep mock data for demo purposes
2. Integrate PSA Pop Report scraper for real population counts
3. Add 50-100 manually curated cards with real eBay pricing
4. Add disclaimer: "Pricing updated weekly from eBay sold listings"

**After Launch (1-3 months):**
1. Integrate eBay API for real-time sold listing data
2. Set up caching to reduce API costs (cache prices for 24-48 hours)
3. Add CardLadder subscription if revenue supports it

---

## Cost Estimates

### Option 1: Free (Development Phase)
- PSA Pop Report: Free
- Manual pricing updates: Free (your time)
- **Total: $0/month**

### Option 2: eBay API Only
- eBay API: ~$0.25 per search
- 1,000 searches/month = $250
- **Total: $250/month**

### Option 3: CardLadder Subscription
- CardLadder: $19.99/month
- Unlimited searches
- **Total: $20/month** ⭐ BEST VALUE

### Option 4: Hybrid (Recommended)
- CardLadder: $19.99/month
- eBay API for recent sales: $50-100/month
- **Total: $70-120/month**

---

## Next Steps

1. **Week 1:** Add PSA Pop Report scraper
2. **Week 2:** Manually add top 50 cards with real pricing
3. **Week 3:** Test with real users, gather feedback
4. **Week 4:** Subscribe to CardLadder if user traction is good
5. **Month 2+:** Integrate eBay API for real-time data

---

## Code Example: eBay API Integration

```javascript
// lib/EbayService.js
import axios from 'axios';

export class EbayService {
  static async getCompletedListings(query) {
    const EBAY_APP_ID = process.env.EBAY_APP_ID;

    const url = 'https://svcs.ebay.com/services/search/FindingService/v1';
    const params = {
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'keywords': query,
      'itemFilter(0).name': 'SoldItemsOnly',
      'itemFilter(0).value': 'true',
      'sortOrder': 'EndTimeSoonest'
    };

    const response = await axios.get(url, { params });
    const items = response.data.findCompletedItemsResponse[0].searchResult[0].item || [];

    // Calculate average sold price
    const prices = items.map(item => parseFloat(item.sellingStatus[0].currentPrice[0].__value__));
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      averagePrice: avgPrice,
      recentSales: items.slice(0, 20)
    };
  }
}
```

---

## Legal Disclaimer

**Important:**
- Web scraping may violate website Terms of Service
- Always prefer official APIs when available
- CardLadder and eBay API are legal, compliant options
- Consult with a lawyer before scraping at scale
