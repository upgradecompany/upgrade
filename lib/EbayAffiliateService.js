/**
 * eBay Affiliate Link Generator
 *
 * Generates eBay Partner Network (EPN) affiliate links for earning commissions.
 * Sign up at: https://epn.ebay.com/
 */

export class EbayAffiliateService {
  // Your EPN Campaign ID (get from https://epn.ebay.com/)
  static CAMPAIGN_ID = process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID || ''

  // Default EPN Publisher ID (you'll get this from EPN dashboard)
  static PUBLISHER_ID = process.env.NEXT_PUBLIC_EBAY_PUBLISHER_ID || '5575xxxxxx'

  /**
   * Generate an eBay affiliate link
   * @param {string} ebayUrl - The original eBay URL
   * @param {string} customId - Optional custom tracking ID (e.g., card name, user ID)
   * @returns {string} - Affiliate link
   */
  static generateAffiliateLink(ebayUrl, customId = '') {
    // If no campaign ID, return regular link
    if (!this.CAMPAIGN_ID || this.CAMPAIGN_ID === 'REPLACE_WITH_YOUR_CAMPAIGN_ID') {
      return ebayUrl
    }

    // Clean the URL
    const cleanUrl = ebayUrl.includes('http') ? ebayUrl : `https://www.ebay.com${ebayUrl}`

    // eBay Rover link format (US marketplace)
    const roverBase = 'https://rover.ebay.com/rover/1/711-53200-19255-0/1'

    const params = new URLSearchParams({
      ff3: '4',
      pub: this.PUBLISHER_ID,
      toolid: '10001',
      campid: this.CAMPAIGN_ID,
      customid: customId,
      mpre: cleanUrl
    })

    return `${roverBase}?${params.toString()}`
  }

  /**
   * Generate affiliate link from eBay item ID
   * @param {string} itemId - eBay item ID
   * @param {string} customId - Optional custom tracking
   * @returns {string} - Affiliate link
   */
  static generateLinkFromItemId(itemId, customId = '') {
    const ebayUrl = `https://www.ebay.com/itm/${itemId}`
    return this.generateAffiliateLink(ebayUrl, customId)
  }

  /**
   * Generate search results affiliate link
   * @param {string} searchQuery - Search query
   * @param {string} customId - Optional custom tracking
   * @returns {string} - Affiliate link to search results
   */
  static generateSearchLink(searchQuery, customId = '') {
    const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=212`
    return this.generateAffiliateLink(ebayUrl, customId)
  }

  /**
   * Generate affiliate link for raw cards (ungraded)
   * @param {string} cardName - Card name/query
   * @returns {string} - Affiliate link
   */
  static generateRawCardLink(cardName) {
    const searchQuery = `${cardName} -PSA -BGS -SGC -graded`
    const customId = `raw-${cardName.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}`
    return this.generateSearchLink(searchQuery, customId)
  }

  /**
   * Generate affiliate link for PSA 10 cards
   * @param {string} cardName - Card name/query
   * @returns {string} - Affiliate link
   */
  static generatePSA10Link(cardName) {
    const searchQuery = `${cardName} PSA 10`
    const customId = `psa10-${cardName.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}`
    return this.generateSearchLink(searchQuery, customId)
  }

  /**
   * Check if affiliate program is configured
   * @returns {boolean}
   */
  static isConfigured() {
    return !!(this.CAMPAIGN_ID && this.CAMPAIGN_ID !== 'REPLACE_WITH_YOUR_CAMPAIGN_ID')
  }

  /**
   * Get affiliate disclosure text (FTC requirement)
   * @returns {string}
   */
  static getDisclosure() {
    return 'UpGrade participates in the eBay Partner Network and may earn commissions on purchases made through links on this site.'
  }
}
