import axios from 'axios';

// Helper function to generate mock price history
const generatePriceHistory = (basePrice, months = 12) => {
  const history = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Generate some variation in pricing
    const variation = (Math.random() - 0.5) * 0.2; // +/- 10%
    const price = basePrice * (1 + variation);

    history.push({
      month: monthName,
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

export class CardService {
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
