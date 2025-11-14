# Data Integration Guide

This guide shows you exactly how to integrate real card pricing data into UpGrade.

## Current Status: Mock Data

The app currently returns test data for these players:
- Tom Brady, LeBron James, Michael Jordan, Patrick Mahomes

For other players, it generates random estimates.

## Integration Options (Ranked by Ease)

1. **eBay API** - Easiest, Free, Real Market Data
2. **Firebase + Manual Entry** - Medium difficulty, Free, Your data
3. **CardLadder/Premium** - Easy, Paid, Comprehensive
4. **Web Scraping** - Hard, Legal gray area, Free

---

## Option 1: eBay API Integration (RECOMMENDED)

### Why eBay?
- FREE up to 5,000 calls/day
- Real sold prices (most accurate market data)
- Already implemented in CardService.js
- Takes 15 minutes to set up

### Step-by-Step Setup

#### 1. Get eBay API Keys

1. Go to https://developer.ebay.com/
2. Click "Register" (top right)
3. Create account (free)
4. Go to "My Account" → "Application Keys"
5. Click "Create Application Key"
6. Choose "Production" keys
7. Copy your "App ID" (Client ID)

#### 2. Add Keys to Your App

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your keys:
```
EBAY_APP_ID=YourActualAppIdHere
EBAY_CERT_ID=YourActualCertIdHere
```

#### 3. Enable eBay in Config

Edit `src/config/api.config.js`:

```javascript
export const API_CONFIG = {
  ebay: {
    enabled: true,  // Change from false to true
    appId: process.env.EBAY_APP_ID || 'YOUR_EBAY_APP_ID',
    certId: process.env.EBAY_CERT_ID || 'YOUR_EBAY_CERT_ID',
    baseUrl: 'https://svcs.ebay.com/services/search/FindingService/v1',
  },

  // ... other configs ...

  useMockData: false,  // Change from true to false
};
```

#### 4. Install Environment Package

```bash
npm install react-native-dotenv
```

Add to `babel.config.js`:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
```

#### 5. Test It

```bash
npm start
```

Search for any card. It will now search eBay's sold listings!

### How It Works

The app searches eBay twice:
1. "[player] [year] [brand] raw" - gets raw card prices
2. "[player] [year] [brand] PSA 10" - gets graded prices

It calculates the average of sold listings and returns the data.

### Limitations & Tips

**eBay API Limits:**
- Free: 5,000 calls/day
- That's ~2,500 card searches per day
- More than enough for starting out

**Improving Results:**
- More specific searches = better results
- Year + Brand + Card # = most accurate
- Just player name = broader range

**Caching Strategy:**
```javascript
// Add to CardService.js
const cache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Check cache before API call
if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
  return cache[cacheKey].data;
}
```

---

## Option 2: Firebase + Manual Data Entry

### Why Firebase?
- FREE tier is generous
- You control the data
- Can curate high-quality cards
- Add community features later

### Step-by-Step Setup

#### 1. Create Firebase Project

1. Go to https://firebase.google.com/
2. Click "Get Started"
3. Click "Add Project"
4. Name it "upgrade-cards"
5. Disable Google Analytics (optional)
6. Click "Create Project"

#### 2. Set Up Firestore Database

1. In Firebase Console, click "Firestore Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for now)
4. Select a region close to your users
5. Click "Enable"

#### 3. Create Data Structure

In Firestore, create a collection called `cards` with documents like:

```javascript
// Document ID: tom-brady-2000-topps-chrome-156
{
  playerName: "Tom Brady",
  year: "2000",
  brand: "Topps Chrome",
  cardNumber: "156",
  rawPrice: 2500.00,
  psa10Price: 25000.00,
  lastUpdated: timestamp,
}
```

#### 4. Add Firebase to Your App

```bash
npm install firebase
```

Create `src/services/FirebaseService.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "upgrade-cards.firebaseapp.com",
  projectId: "upgrade-cards",
  storageBucket: "upgrade-cards.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const searchCardInFirebase = async (playerName, year, brand, cardNumber) => {
  const cardsRef = collection(db, 'cards');
  const q = query(
    cardsRef,
    where('playerName', '==', playerName),
    where('year', '==', year)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }

  return null;
};
```

#### 5. Build Admin Panel (Optional)

Create a simple web form to add cards:
- Player name, year, brand, card number
- Raw price, PSA 10 price
- Save to Firestore

Or use Firebase Console to manually add cards.

### Pros & Cons

**Pros:**
- You control the data quality
- No API rate limits
- Can add custom fields
- Great for niche/curated collections

**Cons:**
- Time-consuming to populate
- Need to keep prices updated
- Limited by your manual efforts

---

## Option 3: CardLadder API Integration

CardLadder is a premium service with comprehensive card pricing data.

### Step-by-Step

1. Sign up at https://www.cardladder.com/
2. Subscribe to their API plan (~$100/month)
3. Get your API key
4. Add to `.env`:
```
CARDLADDER_API_KEY=your_key_here
```

5. Enable in `src/config/api.config.js`:
```javascript
cardLadder: {
  enabled: true,
  apiKey: process.env.CARDLADDER_API_KEY,
  baseUrl: 'https://api.cardladder.com/v1',
},
```

6. Implement in `CardService.js`:
```javascript
static async _fetchFromCardLadder(params) {
  const { apiKey, baseUrl } = API_CONFIG.cardLadder;

  const response = await axios.get(`${baseUrl}/cards/search`, {
    params: {
      player: params.playerName,
      year: params.year,
      // ... other params
    },
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  return {
    name: params.playerName,
    rawPrice: response.data.rawPrice,
    psa10Price: response.data.psa10Price,
    source: 'CardLadder',
    lastUpdated: new Date().toISOString(),
  };
}
```

**Note**: Check CardLadder's actual API documentation for exact endpoints and response format.

---

## Option 4: Web Scraping (Advanced)

### WARNING
Web scraping may violate terms of service. Only scrape sites that explicitly allow it. This is for educational purposes.

### Potential Sources
- PSA Auction Prices (check their terms)
- eBay completed listings (use their API instead)
- COMC marketplace

### Basic Example (Educational)

```javascript
// This is just an example - use official APIs instead
import * as cheerio from 'cheerio';

static async _scrapeExample(playerName) {
  // DON'T actually do this without permission
  const response = await axios.get(`https://example.com/search?q=${playerName}`);
  const $ = cheerio.load(response.data);

  const price = $('.price').first().text();
  return parseFloat(price.replace('$', ''));
}
```

**Recommendation**: Don't use web scraping. Use official APIs or build your own database.

---

## Hybrid Approach (BEST FOR MOST)

Combine multiple sources for best results:

```javascript
static async searchCard(params) {
  // Try eBay first (free, real data)
  if (API_CONFIG.ebay.enabled) {
    try {
      return await this._fetchFromEbay(params);
    } catch (error) {
      console.log('eBay failed, trying next source...');
    }
  }

  // Fallback to Firebase (your curated data)
  if (API_CONFIG.firebase.enabled) {
    try {
      return await this._fetchFromFirebase(params);
    } catch (error) {
      console.log('Firebase failed, trying next source...');
    }
  }

  // Last resort: mock data or error
  return this._getMockData(params.playerName);
}
```

This way:
- eBay provides most cards automatically
- Firebase has your high-value curated cards
- Mock data for complete unknowns

---

## Testing Your Integration

After integrating any data source:

1. **Test Known Cards**
   ```
   Search: Tom Brady 2000 Topps Chrome
   Should return: Real market prices
   ```

2. **Test Partial Info**
   ```
   Search: Patrick Mahomes
   Should return: Multiple results or average
   ```

3. **Test Unknown Cards**
   ```
   Search: Random Player 1990
   Should return: Graceful error or "no data"
   ```

4. **Monitor API Calls**
   - Add logging to see request/response
   - Track API usage
   - Watch for errors

---

## Next Steps After Integration

1. **Add Caching** - Save results for 24 hours
2. **Error Handling** - Better error messages
3. **Loading States** - Show what's happening
4. **Offline Mode** - Cache for offline viewing
5. **Price History** - Track changes over time

---

## Need Help?

Each data source has different requirements:
- eBay: Check their developer docs
- Firebase: Great documentation and community
- CardLadder: Contact their support
- Custom solution: Happy to help design it

Choose the option that fits your budget and needs. Most people should start with eBay API (free + easy) and add Firebase later for curated cards.
