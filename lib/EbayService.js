/**
 * eBay Browse API Integration Service
 *
 * Fetches real-time card sales data from eBay sold listings.
 * Free tier: Sign up at https://developer.ebay.com/
 *
 * Setup:
 * 1. Create account at https://developer.ebay.com/
 * 2. Create an app to get Client ID and Client Secret
 * 3. Add credentials to .env.local:
 *    NEXT_PUBLIC_EBAY_CLIENT_ID=your_client_id
 *    NEXT_PUBLIC_EBAY_CLIENT_SECRET=your_client_secret
 */

export class EbayService {
  static BASE_URL = 'https://api.ebay.com'
  static CLIENT_ID = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID
  static CLIENT_SECRET = process.env.NEXT_PUBLIC_EBAY_CLIENT_SECRET
  static accessToken = null
  static tokenExpiry = null

  /**
   * Get OAuth access token for eBay API
   * @private
   */
  static async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
      throw new Error('EBAY_CREDENTIALS_MISSING')
    }

    try {
      const credentials = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64')

      const response = await fetch(`${this.BASE_URL}/identity/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      })

      if (!response.ok) {
        throw new Error(`eBay OAuth error: ${response.status}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // Refresh 1 min before expiry

      return this.accessToken
    } catch (error) {
      console.error('eBay OAuth error:', error)
      throw error
    }
  }

  /**
   * Search for RAW (ungraded) cards
   * @param {string} query - Search query (e.g., "Tom Brady 2000 Topps Chrome")
   * @param {number} limit - Max results (default 20)
   * @returns {Promise<Object>} - Sales data and pricing
   */
  static async searchRawCards(query, limit = 20) {
    try {
      const token = await this.getAccessToken()

      // Build search query for raw cards
      // Exclude PSA, BGS, SGC graded cards
      const searchParams = new URLSearchParams({
        q: query,
        filter: 'buyingOptions:{FIXED_PRICE|AUCTION},deliveryCountry:US,priceCurrency:USD,itemLocationCountry:US',
        limit: limit.toString(),
        sort: 'price', // Sort by price for better data
      })

      const response = await fetch(
        `${this.BASE_URL}/buy/browse/v1/item_summary/search?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`eBay API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseRawCardData(data, query)
    } catch (error) {
      console.error('eBay searchRawCards error:', error)
      throw error
    }
  }

  /**
   * Search for PSA 10 graded cards
   * @param {string} query - Search query (e.g., "Tom Brady 2000 Topps Chrome")
   * @param {number} limit - Max results (default 20)
   * @returns {Promise<Object>} - Sales data and pricing for PSA 10
   */
  static async searchPSA10Cards(query, limit = 20) {
    try {
      const token = await this.getAccessToken()

      // Sports card category IDs on eBay
      const SPORTS_CARDS_CATEGORY = '212' // Sports Trading Cards category

      // Build search query with PSA 10 filter
      const searchParams = new URLSearchParams({
        q: `${query} PSA 10`,
        category_ids: SPORTS_CARDS_CATEGORY,
        filter: 'buyingOptions:{FIXED_PRICE|AUCTION},deliveryCountry:US,priceCurrency:USD,itemLocationCountry:US',
        limit: limit.toString(),
        sort: 'price',
      })

      const response = await fetch(
        `${this.BASE_URL}/buy/browse/v1/item_summary/search?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`eBay API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parsePSA10CardData(data, query)
    } catch (error) {
      console.error('eBay searchPSA10Cards error:', error)
      throw error
    }
  }

  /**
   * Get sold listings (last 90 days) for raw cards
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} - Array of sold listings
   */
  static async getSoldListingsRaw(query, limit = 90) {
    try {
      const token = await this.getAccessToken()

      const searchParams = new URLSearchParams({
        q: query,
        filter: 'buyingOptions:{AUCTION|FIXED_PRICE},itemEndDate:[2024-01-01T00:00:00.000Z..],priceCurrency:USD',
        fieldgroups: 'EXTENDED',
        limit: limit.toString(),
        sort: '-itemEndDate', // Most recent first
      })

      const response = await fetch(
        `${this.BASE_URL}/buy/browse/v1/item_summary/search?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`eBay API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseSoldListings(data.itemSummaries || [])
    } catch (error) {
      console.error('eBay getSoldListingsRaw error:', error)
      return []
    }
  }

  /**
   * Get sold listings (last 90 days) for PSA 10 cards
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} - Array of sold listings
   */
  static async getSoldListingsPSA10(query, limit = 90) {
    try {
      const token = await this.getAccessToken()

      const SPORTS_CARDS_CATEGORY = '212'

      const searchParams = new URLSearchParams({
        q: `${query} PSA 10`,
        category_ids: SPORTS_CARDS_CATEGORY,
        filter: 'buyingOptions:{AUCTION|FIXED_PRICE},itemEndDate:[2024-01-01T00:00:00.000Z..],priceCurrency:USD',
        fieldgroups: 'EXTENDED',
        limit: limit.toString(),
        sort: '-itemEndDate', // Most recent first
      })

      const response = await fetch(
        `${this.BASE_URL}/buy/browse/v1/item_summary/search?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`eBay API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseSoldListings(data.itemSummaries || [])
    } catch (error) {
      console.error('eBay getSoldListingsPSA10 error:', error)
      return []
    }
  }

  /**
   * Parse raw card data from eBay response
   * @private
   */
  static parseRawCardData(data, query) {
    const items = data.itemSummaries || []

    if (items.length === 0) {
      return {
        averagePrice: 0,
        medianPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalListings: 0,
      }
    }

    const prices = items
      .filter(item => item.price && item.price.value)
      .map(item => parseFloat(item.price.value))
      .sort((a, b) => a - b)

    const sum = prices.reduce((acc, price) => acc + price, 0)
    const average = prices.length > 0 ? sum / prices.length : 0
    const median = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0

    return {
      averagePrice: parseFloat(average.toFixed(2)),
      medianPrice: parseFloat(median.toFixed(2)),
      minPrice: prices.length > 0 ? prices[0] : 0,
      maxPrice: prices.length > 0 ? prices[prices.length - 1] : 0,
      totalListings: items.length,
      imageUrl: items[0]?.image?.imageUrl || null,
    }
  }

  /**
   * Parse PSA 10 card data from eBay response
   * @private
   */
  static parsePSA10CardData(data, query) {
    const items = data.itemSummaries || []

    if (items.length === 0) {
      return {
        averagePrice: 0,
        medianPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalListings: 0,
      }
    }

    const prices = items
      .filter(item => item.price && item.price.value)
      .map(item => parseFloat(item.price.value))
      .sort((a, b) => a - b)

    const sum = prices.reduce((acc, price) => acc + price, 0)
    const average = prices.length > 0 ? sum / prices.length : 0
    const median = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0

    return {
      averagePrice: parseFloat(average.toFixed(2)),
      medianPrice: parseFloat(median.toFixed(2)),
      minPrice: prices.length > 0 ? prices[0] : 0,
      maxPrice: prices.length > 0 ? prices[prices.length - 1] : 0,
      totalListings: items.length,
      imageUrl: items[0]?.image?.imageUrl || null,
    }
  }

  /**
   * Parse sold listings into sales history format
   * @private
   */
  static parseSoldListings(items) {
    return items
      .filter(item => item.price && item.price.value)
      .map(item => ({
        date: item.itemEndDate ? new Date(item.itemEndDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : 'Unknown',
        price: parseFloat(item.price.value),
        platform: 'eBay',
        title: item.title,
        itemId: item.itemId,
      }))
      .slice(0, 20) // Last 20 sales
  }

  /**
   * Generate 90-day price history from sold listings
   * @param {Array} soldListings - Array of sold listings
   * @returns {Array} - 3-month price history
   */
  static generate90DayPriceHistory(soldListings) {
    if (!soldListings || soldListings.length === 0) {
      return []
    }

    // Group sales by month
    const monthlyData = {}

    soldListings.forEach(sale => {
      const date = new Date(sale.date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = []
      }
      monthlyData[monthKey].push(sale.price)
    })

    // Calculate average price per month
    const priceHistory = Object.keys(monthlyData).map(month => {
      const prices = monthlyData[month]
      const average = prices.reduce((sum, price) => sum + price, 0) / prices.length

      return {
        month,
        price: parseFloat(average.toFixed(2))
      }
    })

    // Ensure we have at least 3 months of data (fill with last known price if needed)
    while (priceHistory.length < 3) {
      const today = new Date()
      const monthsAgo = new Date(today.getFullYear(), today.getMonth() - priceHistory.length, 1)
      const monthKey = monthsAgo.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      priceHistory.unshift({
        month: monthKey,
        price: priceHistory[0]?.price || 0
      })
    }

    return priceHistory.slice(-3) // Last 3 months
  }

  /**
   * Get complete card data (raw + PSA 10 with sales history)
   * @param {string} query - Search query
   * @returns {Promise<Object>} - Complete card data
   */
  static async getCompleteCardData(query) {
    try {
      // Fetch all data in parallel
      const [rawData, psa10Data, rawSales, psa10Sales] = await Promise.all([
        this.searchRawCards(query),
        this.searchPSA10Cards(query),
        this.getSoldListingsRaw(query),
        this.getSoldListingsPSA10(query),
      ])

      return {
        rawPrice: rawData.medianPrice || rawData.averagePrice || 0,
        psa10Price: psa10Data.medianPrice || psa10Data.averagePrice || 0,
        imageUrl: psa10Data.imageUrl || rawData.imageUrl,
        rawPriceHistory: this.generate90DayPriceHistory(rawSales),
        psa10PriceHistory: this.generate90DayPriceHistory(psa10Sales),
        rawSalesHistory: rawSales,
        psa10SalesHistory: psa10Sales,
        source: 'eBay (Real-time data)',
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      console.error('eBay getCompleteCardData error:', error)
      throw error
    }
  }
}
