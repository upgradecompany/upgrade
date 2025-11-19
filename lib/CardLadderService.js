/**
 * CardLadder API Integration Service
 *
 * Provides professional card images and pricing data from CardLadder.
 * Sign up at: https://www.cardladder.com/api
 * Cost: $19.99/month
 */

export class CardLadderService {
  static BASE_URL = 'https://api.cardladder.com/v1'
  static API_KEY = process.env.NEXT_PUBLIC_CARDLADDER_API_KEY

  /**
   * Search for cards by player name, year, set, etc.
   * @param {string} query - Search query (e.g., "Michael Jordan 1986 Fleer")
   * @returns {Promise<Array>} - Array of matching cards
   */
  static async searchCards(query) {
    if (!this.API_KEY) {
      console.warn('CardLadder API key not configured. Using mock data.')
      throw new Error('API_KEY_MISSING')
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/search?q=${encodeURIComponent(query)}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`CardLadder API error: ${response.status}`)
      }

      const data = await response.json()

      // Map CardLadder response to our app's format
      return data.cards.map(card => this.mapCardData(card))
    } catch (error) {
      console.error('CardLadder search error:', error)
      throw error
    }
  }

  /**
   * Get card details by CardLadder ID
   * @param {string} cardId - CardLadder card ID
   * @returns {Promise<Object>} - Detailed card data
   */
  static async getCardById(cardId) {
    if (!this.API_KEY) {
      console.warn('CardLadder API key not configured. Using mock data.')
      throw new Error('API_KEY_MISSING')
    }

    try {
      const response = await fetch(`${this.BASE_URL}/cards/${cardId}`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`CardLadder API error: ${response.status}`)
      }

      const card = await response.json()
      return this.mapCardData(card, true) // Include detailed data
    } catch (error) {
      console.error('CardLadder getCardById error:', error)
      throw error
    }
  }

  /**
   * Get detailed card information including sales history
   * @param {Object} card - Card object with id
   * @returns {Promise<Object>} - Full card details with sales history
   */
  static async getCardDetails(card) {
    if (!this.API_KEY) {
      throw new Error('API_KEY_MISSING')
    }

    try {
      const response = await fetch(`${this.BASE_URL}/cards/${card.id}/details`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`CardLadder API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        ...card,
        imageUrl: data.imageUrl,
        priceHistory: this.mapPriceHistory(data.priceHistory),
        salesHistory: this.mapSalesHistory(data.recentSales),
        psa10PopCount: data.psa10Pop,
        psa10GradeSuccess: data.psa10Rate,
        lastUpdated: data.lastUpdated,
        source: 'CardLadder API',
      }
    } catch (error) {
      console.error('CardLadder getCardDetails error:', error)
      throw error
    }
  }

  /**
   * Map CardLadder API response to our app's format
   * @private
   */
  static mapCardData(card, includeDetails = false) {
    const mapped = {
      id: card.id || `${card.year}-${card.set}-${card.number}`.toLowerCase().replace(/\s+/g, '-'),
      name: card.playerName,
      year: card.year,
      brand: card.set,
      cardNumber: card.number,
      sport: card.sport,

      // Professional image from CardLadder
      imageUrl: card.imageUrl || card.image,

      // Pricing data
      rawPrice: card.rawPrice || 0,
      psa10Price: card.psa10Price || 0,

      // Grading data
      psa10PopCount: card.psa10Pop || 0,
      psa10GradeSuccess: card.psa10Rate || 0,

      // Meta
      source: 'CardLadder',
      lastUpdated: card.lastUpdated || new Date().toISOString(),
    }

    // Include detailed data if requested
    if (includeDetails && card.priceHistory) {
      mapped.priceHistory = this.mapPriceHistory(card.priceHistory)
      mapped.salesHistory = this.mapSalesHistory(card.recentSales)
    }

    return mapped
  }

  /**
   * Map price history data
   * @private
   */
  static mapPriceHistory(priceHistory) {
    if (!priceHistory || !Array.isArray(priceHistory)) {
      return []
    }

    return priceHistory.map(point => ({
      date: point.date,
      price: point.price,
      grade: point.grade || 10,
    }))
  }

  /**
   * Map sales history data
   * @private
   */
  static mapSalesHistory(salesHistory) {
    if (!salesHistory || !Array.isArray(salesHistory)) {
      return []
    }

    return salesHistory.map(sale => ({
      date: sale.date,
      price: sale.price,
      grade: sale.grade || 10,
      seller: sale.seller || 'eBay',
      certNumber: sale.certNumber || '',
    }))
  }

  /**
   * Get trending cards
   * @returns {Promise<Array>} - Array of trending cards
   */
  static async getTrendingCards(limit = 20) {
    if (!this.API_KEY) {
      throw new Error('API_KEY_MISSING')
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/trending?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`CardLadder API error: ${response.status}`)
      }

      const data = await response.json()
      return data.cards.map(card => this.mapCardData(card))
    } catch (error) {
      console.error('CardLadder getTrendingCards error:', error)
      throw error
    }
  }

  /**
   * Get top profit potential cards (for THE LIST)
   * @returns {Promise<Array>} - Array of high-profit cards
   */
  static async getTopProfitCards(limit = 20) {
    if (!this.API_KEY) {
      throw new Error('API_KEY_MISSING')
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/cards/top-profit?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`CardLadder API error: ${response.status}`)
      }

      const data = await response.json()
      return data.cards.map(card => this.mapCardData(card))
    } catch (error) {
      console.error('CardLadder getTopProfitCards error:', error)
      throw error
    }
  }
}
