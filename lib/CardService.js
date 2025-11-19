import axios from 'axios';
import { EbayService } from './EbayService';

// Check if eBay API is configured
const USE_EBAY_API = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID && process.env.NEXT_PUBLIC_EBAY_CLIENT_SECRET;

// Helper function to generate mock price history
const generatePriceHistory = (basePrice, weeks = 12) => {
  const history = [];
  const today = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - (i * 7)); // Go back i weeks

    const weekLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Generate some variation in pricing
    const variation = (Math.random() - 0.5) * 0.2; // +/- 10%
    const price = basePrice * (1 + variation);

    history.push({
      month: weekLabel, // Keep the key name for compatibility
      price: parseFloat(price.toFixed(2))
    });
  }

  return history;
};

// Helper function to generate recent sales data
const generateSalesHistory = (basePrice, count = 20) => {
  const sales = [];
  const platforms = ['eBay', 'PWCC', 'Goldin', 'Heritage', 'COMC', 'MySlabs'];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    // Generate random date within last 60 days
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    const saleDate = new Date(today);
    saleDate.setDate(today.getDate() - daysAgo);

    // Generate price variation around base price
    const variation = (Math.random() - 0.5) * 0.25; // +/- 12.5%
    const price = basePrice * (1 + variation);

    sales.push({
      date: saleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      price: parseFloat(price.toFixed(2)),
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      id: `sale-${i + 1}`
    });
  }

  // Sort by most recent first
  return sales.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Mock data for testing
const MOCK_DATA = {
  'tom brady': {
    name: 'Tom Brady',
    year: '2000',
    brand: 'Topps Chrome',
    cardNumber: '156',
    rawPrice: 2500.00,
    psa10Price: 25000.00,
    psa10PopCount: 1847,
    psa10GradeSuccess: 12.5,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
    source: 'Mock Data (for testing)',
    lastUpdated: new Date().toISOString(),
  },
  'lebron james': {
    name: 'LeBron James',
    year: '2003',
    brand: 'Topps Chrome',
    cardNumber: '111',
    rawPrice: 5000.00,
    psa10Price: 75000.00,
    psa10PopCount: 2341,
    psa10GradeSuccess: 8.2,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
    source: 'Mock Data (for testing)',
    lastUpdated: new Date().toISOString(),
  },
  'michael jordan': {
    name: 'Michael Jordan',
    year: '1986',
    brand: 'Fleer',
    cardNumber: '57',
    rawPrice: 3000.00,
    psa10Price: 150000.00,
    psa10PopCount: 316,
    psa10GradeSuccess: 2.1,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
    source: 'Mock Data (for testing)',
    lastUpdated: new Date().toISOString(),
  },
  'patrick mahomes': {
    name: 'Patrick Mahomes',
    year: '2017',
    brand: 'Panini Prizm',
    cardNumber: '127',
    rawPrice: 1500.00,
    psa10Price: 15000.00,
    psa10PopCount: 4892,
    psa10GradeSuccess: 18.7,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
    source: 'Mock Data (for testing)',
    lastUpdated: new Date().toISOString(),
  },
};

// Extended mock data with multiple card variations
const EXTENDED_MOCK_DATA = [
  {
    id: 'tom-brady-2000-chrome',
    name: 'Tom Brady',
    year: '2000',
    brand: 'Topps Chrome',
    cardNumber: '156',
    sport: 'Football',
    rawPrice: 2500.00,
    psa10Price: 25000.00,
    psa10PopCount: 1847,
    psa10GradeSuccess: 12.5,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'tom-brady-2000-bowman',
    name: 'Tom Brady',
    year: '2000',
    brand: 'Bowman Chrome',
    cardNumber: '236',
    sport: 'Football',
    rawPrice: 1800.00,
    psa10Price: 18000.00,
    psa10PopCount: 2103,
    psa10GradeSuccess: 14.2,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'lebron-james-2003-chrome',
    name: 'LeBron James',
    year: '2003',
    brand: 'Topps Chrome',
    cardNumber: '111',
    sport: 'Basketball',
    rawPrice: 5000.00,
    psa10Price: 75000.00,
    psa10PopCount: 2341,
    psa10GradeSuccess: 8.2,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'lebron-james-2003-ud',
    name: 'LeBron James',
    year: '2003',
    brand: 'Upper Deck',
    cardNumber: '301',
    sport: 'Basketball',
    rawPrice: 3500.00,
    psa10Price: 45000.00,
    psa10PopCount: 1876,
    psa10GradeSuccess: 11.3,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'michael-jordan-1986-fleer',
    name: 'Michael Jordan',
    year: '1986',
    brand: 'Fleer',
    cardNumber: '57',
    sport: 'Basketball',
    rawPrice: 3000.00,
    psa10Price: 150000.00,
    psa10PopCount: 316,
    psa10GradeSuccess: 2.1,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'patrick-mahomes-2017-prizm',
    name: 'Patrick Mahomes',
    year: '2017',
    brand: 'Panini Prizm',
    cardNumber: '127',
    sport: 'Football',
    rawPrice: 1500.00,
    psa10Price: 15000.00,
    psa10PopCount: 4892,
    psa10GradeSuccess: 18.7,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'kobe-bryant-1996-chrome',
    name: 'Kobe Bryant',
    year: '1996',
    brand: 'Topps Chrome',
    cardNumber: '138',
    sport: 'Basketball',
    rawPrice: 2200,
    psa10Price: 35000,
    psa10PopCount: 892,
    psa10GradeSuccess: 5.3,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'luka-doncic-2018-prizm',
    name: 'Luka Doncic',
    year: '2018',
    brand: 'Panini Prizm',
    cardNumber: '280',
    sport: 'Basketball',
    rawPrice: 800,
    psa10Price: 12000,
    psa10PopCount: 5234,
    psa10GradeSuccess: 22.1,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'mike-trout-2011-update',
    name: 'Mike Trout',
    year: '2011',
    brand: 'Topps Update',
    cardNumber: 'US175',
    sport: 'Baseball',
    rawPrice: 1200,
    psa10Price: 18000,
    psa10PopCount: 3421,
    psa10GradeSuccess: 15.4,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'shohei-ohtani-2018-chrome',
    name: 'Shohei Ohtani',
    year: '2018',
    brand: 'Topps Chrome',
    cardNumber: '700',
    sport: 'Baseball',
    rawPrice: 600,
    psa10Price: 8500,
    psa10PopCount: 4123,
    psa10GradeSuccess: 19.8,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'giannis-2013-prizm',
    name: 'Giannis Antetokounmpo',
    year: '2013',
    brand: 'Panini Prizm',
    cardNumber: '290',
    sport: 'Basketball',
    rawPrice: 900,
    psa10Price: 12500,
    psa10PopCount: 2845,
    psa10GradeSuccess: 17.2,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'justin-herbert-2020-prizm',
    name: 'Justin Herbert',
    year: '2020',
    brand: 'Panini Prizm',
    cardNumber: '325',
    sport: 'Football',
    rawPrice: 400,
    psa10Price: 5500,
    psa10PopCount: 6234,
    psa10GradeSuccess: 24.5,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'zion-2019-prizm',
    name: 'Zion Williamson',
    year: '2019',
    brand: 'Panini Prizm',
    cardNumber: '248',
    sport: 'Basketball',
    rawPrice: 550,
    psa10Price: 7800,
    psa10PopCount: 5123,
    psa10GradeSuccess: 21.3,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'aaron-judge-2017-chrome',
    name: 'Aaron Judge',
    year: '2017',
    brand: 'Topps Chrome',
    cardNumber: '169',
    sport: 'Baseball',
    rawPrice: 380,
    psa10Price: 5200,
    psa10PopCount: 4567,
    psa10GradeSuccess: 23.1,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'joe-burrow-2020-prizm',
    name: 'Joe Burrow',
    year: '2020',
    brand: 'Panini Prizm',
    cardNumber: '301',
    sport: 'Football',
    rawPrice: 320,
    psa10Price: 4500,
    psa10PopCount: 5890,
    psa10GradeSuccess: 26.2,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'ronald-acuna-2018-chrome',
    name: 'Ronald Acuna Jr.',
    year: '2018',
    brand: 'Topps Chrome',
    cardNumber: '193',
    sport: 'Baseball',
    rawPrice: 290,
    psa10Price: 4000,
    psa10PopCount: 4123,
    psa10GradeSuccess: 25.8,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'ja-morant-2019-prizm',
    name: 'Ja Morant',
    year: '2019',
    brand: 'Panini Prizm',
    cardNumber: '249',
    sport: 'Basketball',
    rawPrice: 270,
    psa10Price: 3800,
    psa10PopCount: 4567,
    psa10GradeSuccess: 27.4,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'tatis-2019-chrome',
    name: 'Fernando Tatis Jr.',
    year: '2019',
    brand: 'Topps Chrome',
    cardNumber: '410',
    sport: 'Baseball',
    rawPrice: 250,
    psa10Price: 3500,
    psa10PopCount: 3890,
    psa10GradeSuccess: 28.1,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'cj-stroud-2023-prizm',
    name: 'CJ Stroud',
    year: '2023',
    brand: 'Panini Prizm',
    cardNumber: '301',
    sport: 'Football',
    rawPrice: 180,
    psa10Price: 2800,
    psa10PopCount: 2456,
    psa10GradeSuccess: 32.5,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
  {
    id: 'wembanyama-2023-prizm',
    name: 'Victor Wembanyama',
    year: '2023',
    brand: 'Panini Prizm',
    cardNumber: '1',
    sport: 'Basketball',
    rawPrice: 220,
    psa10Price: 3200,
    psa10PopCount: 1890,
    psa10GradeSuccess: 30.2,
    imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
  },
];

export class CardService {
  // Get card by ID
  static async getCardById(cardId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find the card in EXTENDED_MOCK_DATA
    const card = EXTENDED_MOCK_DATA.find(c => c.id === cardId);

    if (!card) {
      return null;
    }

    // Return full card details
    return this.getCardDetails(card);
  }

  // New keyword search method
  static async searchCards(query) {
    // Try eBay API first if configured
    if (USE_EBAY_API) {
      try {
        console.log('Using eBay API for search:', query);

        // Call our API route instead of direct eBay API
        const response = await fetch(`/api/ebay/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const ebayData = await response.json();

        // Parse card details from query
        const parts = query.split(/\s+/);
        const yearMatch = parts.find(part => /^\d{4}$/.test(part));
        const nameWords = parts.filter(part => !/^\d{4}$/.test(part) && !/^#?\d{1,3}$/.test(part));
        // Card numbers are 1-3 digits (not 4-digit years)
        const hasCardNumber = parts.some(part => /^#?\d{1,3}$/.test(part) && !/^\d{4}$/.test(part));

        // Check if search is specific (has brand name like Prizm, Topps, Panini, etc.)
        const brandKeywords = ['prizm', 'topps', 'panini', 'bowman', 'fleer', 'upper', 'deck', 'donruss', 'select', 'chrome', 'optic'];
        const hasSpecificBrand = brandKeywords.some(brand => query.toLowerCase().includes(brand));

        console.log('Search analysis:', {
          query,
          hasSpecificBrand,
          hasCardNumber,
          rawResultsCount: ebayData.rawResults?.length || 0
        });

        // If search is vague (no specific brand or card number), return multiple cards from eBay results
        if (!hasSpecificBrand && !hasCardNumber && ebayData.rawResults?.length > 1) {
          console.log('Returning multiple cards from eBay results');
          const cards = [];
          const uniqueTitles = new Set();

          // Create cards from eBay results (limit to 10)
          // Use PSA 10 results for images when available
          for (let i = 0; i < Math.min(10, ebayData.rawResults.length); i++) {
            const item = ebayData.rawResults[i];
            const title = item.title || '';

            // Skip duplicates
            if (uniqueTitles.has(title)) continue;
            uniqueTitles.add(title);

            // Extract brand from title
            let brand = 'Various';
            for (const keyword of brandKeywords) {
              if (title.toLowerCase().includes(keyword)) {
                brand = keyword.charAt(0).toUpperCase() + keyword.slice(1);
                break;
              }
            }

            // Try to get PSA 10 image for this card, fallback to raw image
            const psa10Item = ebayData.psa10Results?.[i];
            const imageUrl = psa10Item?.image?.imageUrl || item.image?.imageUrl || ebayData.imageUrl || 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800';

            cards.push({
              id: `${query}-${cards.length}`.toLowerCase().replace(/\s+/g, '-'),
              name: nameWords.join(' ') || query,
              year: yearMatch || new Date().getFullYear().toString(),
              brand: brand,
              cardNumber: title.match(/#(\d+)/)?.[1] || 'N/A',
              sport: this.detectSport(query),
              rawPrice: parseFloat(item.price?.value || 0),
              psa10Price: 0, // Will be calculated when selected
              psa10PopCount: 0,
              psa10GradeSuccess: 0,
              imageUrl: imageUrl,
              title: title, // Store full title for display
            });
          }

          return cards.length > 0 ? cards : [this.buildSingleCard(query, ebayData, parts, yearMatch, nameWords)];
        }

        // Specific search - return single card
        return [this.buildSingleCard(query, ebayData, parts, yearMatch, nameWords)];
      } catch (error) {
        console.warn('eBay API failed, falling back to mock data:', error.message);
        // Fall through to mock data
      }
    }

    // Fallback: Use mock data
    console.log('Using mock data for search:', query);
    await new Promise(resolve => setTimeout(resolve, 800));

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const results = [];

    // Search through all cards
    for (const card of EXTENDED_MOCK_DATA) {
      const cardText = `${card.name} ${card.year} ${card.brand} ${card.cardNumber}`.toLowerCase();

      // Check if all search terms are found in the card text
      const matchesAll = searchTerms.every(term => cardText.includes(term));

      if (matchesAll) {
        results.push(card);
      }
    }

    return results;
  }

  // Helper method to build a single card from eBay data
  static buildSingleCard(query, ebayData, parts, yearMatch, nameWords) {
    return {
      id: query.toLowerCase().replace(/\s+/g, '-'),
      name: nameWords.slice(0, -1).join(' ') || nameWords.join(' ') || query,
      year: yearMatch || new Date().getFullYear().toString(),
      brand: nameWords[nameWords.length - 1] || 'Various',
      cardNumber: parts.find(part => /^#?\d+$/.test(part))?.replace('#', '') || 'N/A',
      sport: this.detectSport(query),
      rawPrice: ebayData.rawPrice,
      psa10Price: ebayData.psa10Price,
      psa10PopCount: 0,
      psa10GradeSuccess: 0,
      imageUrl: ebayData.imageUrl || 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
    };
  }

  // Helper method to detect sport from query
  static detectSport(query) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('football') || lowerQuery.includes('nfl') || lowerQuery.includes('brady') || lowerQuery.includes('mahomes')) {
      return 'Football';
    } else if (lowerQuery.includes('basketball') || lowerQuery.includes('nba') || lowerQuery.includes('lebron') || lowerQuery.includes('jordan')) {
      return 'Basketball';
    } else if (lowerQuery.includes('baseball') || lowerQuery.includes('mlb') || lowerQuery.includes('trout')) {
      return 'Baseball';
    }
    return 'Unknown';
  }

  // Get full details for a specific card
  static async getCardDetails(card) {
    // Try eBay API first if configured
    if (USE_EBAY_API) {
      try {
        console.log('Fetching eBay details for:', card.name, card.year, card.brand);
        const query = `${card.name} ${card.year} ${card.brand}`.trim();

        // Call our API route instead of direct eBay API
        const response = await fetch(`/api/ebay/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const ebayData = await response.json();

        const gradingCost = 100;
        const totalProfitEstimate = ebayData.psa10Price - ebayData.rawPrice - gradingCost;

        // Use real sales history from eBay, or generate mock if not available
        const rawSalesHistory = ebayData.rawSalesHistory && ebayData.rawSalesHistory.length > 0
          ? ebayData.rawSalesHistory
          : generateSalesHistory(ebayData.rawPrice);

        const psa10SalesHistory = ebayData.psa10SalesHistory && ebayData.psa10SalesHistory.length > 0
          ? ebayData.psa10SalesHistory
          : generateSalesHistory(ebayData.psa10Price);

        console.log('Sales history check:', {
          rawLength: rawSalesHistory.length,
          psa10Length: psa10SalesHistory.length,
          rawSample: rawSalesHistory[0],
          psa10Sample: psa10SalesHistory[0]
        });

        // Generate price history from sales data
        const rawPriceHistory = generatePriceHistory(ebayData.rawPrice);
        const psa10PriceHistory = generatePriceHistory(ebayData.psa10Price);

        return {
          ...card,
          rawPrice: ebayData.rawPrice,
          psa10Price: ebayData.psa10Price,
          imageUrl: ebayData.imageUrl || card.imageUrl,
          rawPriceHistory,
          psa10PriceHistory,
          rawSalesHistory,
          psa10SalesHistory,
          gradingCost,
          totalProfitEstimate,
          source: 'eBay API',
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.warn('eBay API failed for card details, using mock data:', error.message);
        // Fall through to mock data
      }
    }

    // Fallback: Generate mock data
    await new Promise(resolve => setTimeout(resolve, 500));

    const rawPriceHistory = generatePriceHistory(card.rawPrice);
    const psa10PriceHistory = generatePriceHistory(card.psa10Price);
    const rawSalesHistory = generateSalesHistory(card.rawPrice, 20);
    const psa10SalesHistory = generateSalesHistory(card.psa10Price, 20);
    const gradingCost = 100;
    const totalProfitEstimate = card.psa10Price - card.rawPrice - gradingCost;

    return {
      ...card,
      rawPriceHistory,
      psa10PriceHistory,
      rawSalesHistory,
      psa10SalesHistory,
      gradingCost,
      totalProfitEstimate,
      source: 'Mock Data (for testing)',
      lastUpdated: new Date().toISOString(),
    };
  }

  // Legacy method for backward compatibility
  static async searchCard(params) {
    const { playerName, year, cardNumber, brand } = params;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const key = playerName.toLowerCase().trim();
    const mockCard = MOCK_DATA[key];

    if (mockCard) {
      const rawPriceHistory = generatePriceHistory(mockCard.rawPrice);
      const psa10PriceHistory = generatePriceHistory(mockCard.psa10Price);
      const rawSalesHistory = generateSalesHistory(mockCard.rawPrice, 20);
      const psa10SalesHistory = generateSalesHistory(mockCard.psa10Price, 20);
      const gradingCost = 100; // Average grading cost
      const totalProfitEstimate = mockCard.psa10Price - mockCard.rawPrice - gradingCost;

      return {
        ...mockCard,
        year: year || mockCard.year,
        cardNumber: cardNumber || mockCard.cardNumber,
        brand: brand || mockCard.brand,
        rawPriceHistory,
        psa10PriceHistory,
        rawSalesHistory,
        psa10SalesHistory,
        gradingCost,
        totalProfitEstimate,
      };
    }

    // Generate estimated data for unknown cards
    const estimatedRawPrice = 100 + Math.random() * 500;
    const multiplier = 5 + Math.random() * 10;
    const psa10Price = estimatedRawPrice * multiplier;
    const gradingCost = 100;

    return {
      name: playerName,
      year: year || 'Unknown',
      brand: brand || 'Various',
      cardNumber: cardNumber || 'N/A',
      rawPrice: parseFloat(estimatedRawPrice.toFixed(2)),
      psa10Price: parseFloat(psa10Price.toFixed(2)),
      psa10PopCount: Math.floor(Math.random() * 5000) + 100,
      psa10GradeSuccess: parseFloat((Math.random() * 15 + 2).toFixed(1)),
      imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
      rawPriceHistory: generatePriceHistory(estimatedRawPrice),
      psa10PriceHistory: generatePriceHistory(psa10Price),
      rawSalesHistory: generateSalesHistory(estimatedRawPrice, 20),
      psa10SalesHistory: generateSalesHistory(psa10Price, 20),
      gradingCost,
      totalProfitEstimate: psa10Price - estimatedRawPrice - gradingCost,
      source: 'Mock Data - Estimated (for testing)',
      lastUpdated: new Date().toISOString(),
    };
  }
}
