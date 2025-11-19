'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CardService } from '../../lib/CardService'
import { EbayAffiliateService } from '../../lib/EbayAffiliateService'
import PriceChart from '../../components/PriceChart'
import SalesHistory from '../../components/SalesHistory'
import { useAuth } from '@/lib/AuthContext'

export default function CardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [cardData, setCardData] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [error, setError] = useState('')
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [portfolioQuantity, setPortfolioQuantity] = useState(1)
  const [portfolioPurchasePrice, setPortfolioPurchasePrice] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    user,
    addToWatchlist,
    addToPortfolio,
    isInWatchlist,
    isInPortfolio,
  } = useAuth()

  // Check for direct card ID in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const cardId = urlParams.get('id')

    if (cardId) {
      loadCardById(cardId)
    }
  }, [])

  const loadCardById = async (cardId) => {
    setLoading(true)
    setError('')

    try {
      const data = await CardService.getCardById(cardId)
      if (data) {
        setCardData(data)
      } else {
        setError('Card not found')
      }
    } catch (err) {
      setError('Failed to load card data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError('')
    setCardData(null)
    setSearchResults(null)

    try {
      const results = await CardService.searchCards(searchQuery.trim())

      if (results.length === 0) {
        setError('No cards found. Try a different search.')
      } else if (results.length === 1) {
        // If only one result, get full details including sales history
        const cardDetails = await CardService.getCardDetails(results[0])
        setCardData(cardDetails)
      } else {
        // Multiple results, show selection screen
        setSearchResults(results)
      }
    } catch (err) {
      setError('Failed to fetch card data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCard = async (selectedCard) => {
    setLoading(true)
    try {
      const data = await CardService.getCardDetails(selectedCard)
      setCardData(data)
      setSearchResults(null)
    } catch (err) {
      setError('Failed to fetch card details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWatchlist = () => {
    if (!user) {
      setError('Please log in to add cards to your watchlist')
      return
    }

    addToWatchlist(cardData)
    setSuccessMessage('Card added to watchlist!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleOpenPortfolioModal = () => {
    if (!user) {
      setError('Please log in to add cards to your portfolio')
      return
    }

    setShowPortfolioModal(true)
    setPortfolioPurchasePrice(cardData.rawPrice.toString())
  }

  const handleAddToPortfolio = () => {
    if (!portfolioPurchasePrice || parseFloat(portfolioPurchasePrice) <= 0) {
      setError('Please enter a valid purchase price')
      return
    }

    addToPortfolio(
      cardData,
      parseInt(portfolioQuantity),
      parseFloat(portfolioPurchasePrice)
    )

    setShowPortfolioModal(false)
    setSuccessMessage('Card added to portfolio!')
    setTimeout(() => setSuccessMessage(''), 3000)

    // Reset form
    setPortfolioQuantity(1)
    setPortfolioPurchasePrice('')
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'N/A'
    return `$${parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-3xl font-bold">
                <span className="text-blue-600">Up</span>
                <span className="text-gray-800">Grade</span>
              </div>
            </Link>
            <Link
              href="/list"
              className="text-gray-700 hover:text-blue-600 font-bold text-lg transition-colors"
            >
              THE LIST
            </Link>
          </div>
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!cardData && !searchResults ? (
          // Search Form
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Search for a Card
              </h1>
              <p className="text-gray-600 mb-8">
                Enter player details to see comprehensive grading analysis
              </p>

              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Player Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Tom Brady 2000, LeBron James Topps Chrome"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    'Search Cards'
                  )}
                </button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-semibold mb-2">💡 Try These:</p>
                <p className="text-xs text-blue-800">
                  "Tom Brady 2000", "LeBron James Topps Chrome", "Michael Jordan 1986", or "Patrick Mahomes Prizm"
                </p>
              </div>
            </div>
          </div>
        ) : searchResults ? (
          // Card Selection Screen
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select Your Card
              </h2>
              <p className="text-gray-600 mb-6">
                We found {searchResults.length} cards matching your search. Click on the correct one:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {searchResults.map((card, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectCard(card)}
                    className="text-left bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-4 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex-shrink-0 flex items-center justify-center">
                        <span className="text-4xl">{card.sport === 'Basketball' ? '🏀' : card.sport === 'Baseball' ? '⚾' : '🏈'}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{card.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {card.year} {card.brand}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          #{card.cardNumber}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                            PSA 10: {formatCurrency(card.psa10Price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setSearchResults(null)
                  setSearchQuery('')
                }}
                className="mt-6 px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-all"
              >
                ← Back to Search
              </button>
            </div>
          </div>
        ) : cardData ? (
          // Card Results
          <div className="space-y-8">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {successMessage}
              </div>
            )}

            {/* Card Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{cardData.name}</h1>
                <p className="text-lg text-gray-600 mt-1">
                  {cardData.year} {cardData.brand} #{cardData.cardNumber}
                </p>
              </div>
              <div className="flex gap-3">
                {user && (
                  <>
                    <button
                      onClick={handleAddToWatchlist}
                      disabled={isInWatchlist(cardData.id)}
                      className={`px-6 py-3 font-semibold rounded-lg transition-all flex items-center gap-2 ${
                        isInWatchlist(cardData.id)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {isInWatchlist(cardData.id) ? 'In Watchlist' : 'Add to Watchlist'}
                    </button>
                    <button
                      onClick={handleOpenPortfolioModal}
                      disabled={isInPortfolio(cardData.id)}
                      className={`px-6 py-3 font-semibold rounded-lg transition-all flex items-center gap-2 ${
                        isInPortfolio(cardData.id)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {isInPortfolio(cardData.id) ? 'In Portfolio' : 'Add to Portfolio'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setCardData(null)
                    setSearchQuery('')
                  }}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all"
                >
                  New Search
                </button>
              </div>
            </div>

            {/* PSA Grading Case - Full Width */}
            <div className="max-w-6xl mx-auto perspective-1000">
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #e8e8e8 0%, #f5f5f5 25%, #ffffff 50%, #f5f5f5 75%, #e8e8e8 100%)',
                  boxShadow: `
                    0 30px 60px -15px rgba(0, 0, 0, 0.5),
                    0 10px 20px -10px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                    inset 2px 0 2px rgba(255, 255, 255, 0.3),
                    inset -2px 0 2px rgba(0, 0, 0, 0.1)
                  `,
                  border: '2px solid rgba(200, 200, 200, 0.5)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {/* Top edge highlight - simulating thick plastic */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none z-30"></div>

                {/* Left edge highlight */}
                <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-r from-white/40 to-transparent pointer-events-none z-30"></div>

                {/* Right edge shadow */}
                <div className="absolute top-0 right-0 bottom-0 w-3 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-30"></div>

                {/* Bottom edge shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-black/15 to-transparent pointer-events-none z-30"></div>

                {/* Glossy reflection sweep */}
                <div
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{
                    background: 'linear-gradient(125deg, transparent 0%, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 55%, transparent 60%, transparent 100%)'
                  }}
                ></div>

                {/* Inner content wrapper with padding */}
                <div className="relative z-10 p-8" style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(240,240,240,0.2))'
                }}>
                  {/* PSA Header - Red Outline Style */}
                  <div
                    className="relative bg-white border-8 border-red-600 mb-6 p-4"
                    style={{
                      boxShadow: `
                        0 4px 6px rgba(0, 0, 0, 0.1),
                        0 1px 3px rgba(0, 0, 0, 0.08),
                        inset 0 1px 0 rgba(255, 255, 255, 0.5)
                      `
                    }}
                  >
                    <div className="flex justify-between items-start">
                      {/* Left Side - Card Details */}
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                          {cardData.year} {cardData.brand}
                        </div>
                        <div className="text-lg font-bold text-gray-900 uppercase mt-1">
                          {cardData.name}
                        </div>
                        <div className="text-xs text-gray-700 mt-1">
                          #{cardData.cardNumber}
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          PSA/DNA CERT
                        </div>
                      </div>

                      {/* Right Side - Grade */}
                      <div className="text-right">
                        <div className="text-xs font-semibold text-gray-600">GEM MT</div>
                        <div className="text-5xl font-bold text-gray-900">10</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Card Image */}
                    <div className="lg:col-span-1">
                      {/* Card in Protective Case */}
                      <div
                        className="relative rounded-lg overflow-hidden"
                        style={{
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(248,248,248,0.6) 50%, rgba(235,235,235,0.4) 100%)',
                          boxShadow: `
                            0 10px 25px rgba(0,0,0,0.25),
                            0 5px 10px rgba(0,0,0,0.15),
                            inset 0 2px 4px rgba(255,255,255,0.6),
                            inset 0 -2px 4px rgba(0,0,0,0.08),
                            inset 2px 0 3px rgba(255,255,255,0.4),
                            inset -2px 0 3px rgba(0,0,0,0.08)
                          `,
                          border: '2px solid rgba(220, 220, 220, 0.6)'
                        }}
                      >
                        {/* Top edge shine */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/50 to-transparent pointer-events-none z-10"></div>

                        {/* Left edge shine */}
                        <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-white/40 to-transparent pointer-events-none z-10"></div>

                        {/* Inner protective layer */}
                        <div className="relative p-4 m-3" style={{
                          background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(250,250,250,0.95))',
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(255,255,255,0.5)'
                        }}>
                          <div
                            className="aspect-[2/3] relative bg-white rounded overflow-hidden"
                            style={{
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Image
                              src={cardData.imageUrl}
                              alt={`${cardData.name} card`}
                              fill
                              className="object-contain"
                              onError={(e) => {
                                // Fallback if image doesn't load
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        </div>

                        {/* Diagonal reflection sweep on plastic */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, transparent 0%, transparent 30%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.2) 60%, transparent 70%, transparent 100%)'
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Right Column - Data */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Raw Card Value */}
                        <div
                          className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 relative overflow-hidden"
                          style={{
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)',
                            clipPath: `polygon(
                              0% 2%, 2% 0%, 4% 2%, 6% 0%, 8% 1%, 10% 0%, 12% 2%, 14% 0%, 16% 1%, 18% 0%,
                              20% 2%, 22% 0%, 24% 1%, 26% 0%, 28% 2%, 30% 0%, 32% 1%, 34% 0%, 36% 2%,
                              38% 0%, 40% 1%, 42% 0%, 44% 2%, 46% 0%, 48% 1%, 50% 0%, 52% 2%, 54% 0%,
                              56% 1%, 58% 0%, 60% 2%, 62% 0%, 64% 1%, 66% 0%, 68% 2%, 70% 0%, 72% 1%,
                              74% 0%, 76% 2%, 78% 0%, 80% 1%, 82% 0%, 84% 2%, 86% 0%, 88% 1%, 90% 0%,
                              92% 2%, 94% 0%, 96% 1%, 98% 0%, 100% 2%,
                              100% 98%, 98% 100%, 96% 98%, 94% 100%, 92% 99%, 90% 100%, 88% 98%, 86% 100%,
                              84% 99%, 82% 100%, 80% 98%, 78% 100%, 76% 99%, 74% 100%, 72% 98%, 70% 100%,
                              68% 99%, 66% 100%, 64% 98%, 62% 100%, 60% 99%, 58% 100%, 56% 98%, 54% 100%,
                              52% 99%, 50% 100%, 48% 98%, 46% 100%, 44% 99%, 42% 100%, 40% 98%, 38% 100%,
                              36% 99%, 34% 100%, 32% 98%, 30% 100%, 28% 99%, 26% 100%, 24% 98%, 22% 100%,
                              20% 99%, 18% 100%, 16% 98%, 14% 100%, 12% 99%, 10% 100%, 8% 98%, 6% 100%,
                              4% 99%, 2% 100%, 0% 98%,
                              0% 2%
                            )`
                          }}
                        >
                          {/* Paper texture overlay */}
                          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.3"/%3E%3C/svg%3E")',
                          }}></div>

                          <div className="relative z-10">
                            <div className="text-sm font-bold text-orange-700 uppercase mb-2 tracking-wider">
                              RAW CARD VALUE
                            </div>
                            <div className="text-5xl font-black text-gray-900 mb-2" style={{
                              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              {formatCurrency(cardData.rawPrice)}
                            </div>
                            <div className="text-sm text-orange-800 font-semibold">
                              Current market value
                            </div>
                          </div>

                          {/* Decorative corner tear */}
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-orange-200 to-yellow-200 opacity-60" style={{
                            clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                          }}></div>
                        </div>

                        {/* PSA 10 Value */}
                        <div
                          className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 relative overflow-hidden"
                          style={{
                            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2), 0 4px 8px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)',
                            clipPath: `polygon(
                              0% 2%, 2% 0%, 4% 2%, 6% 0%, 8% 1%, 10% 0%, 12% 2%, 14% 0%, 16% 1%, 18% 0%,
                              20% 2%, 22% 0%, 24% 1%, 26% 0%, 28% 2%, 30% 0%, 32% 1%, 34% 0%, 36% 2%,
                              38% 0%, 40% 1%, 42% 0%, 44% 2%, 46% 0%, 48% 1%, 50% 0%, 52% 2%, 54% 0%,
                              56% 1%, 58% 0%, 60% 2%, 62% 0%, 64% 1%, 66% 0%, 68% 2%, 70% 0%, 72% 1%,
                              74% 0%, 76% 2%, 78% 0%, 80% 1%, 82% 0%, 84% 2%, 86% 0%, 88% 1%, 90% 0%,
                              92% 2%, 94% 0%, 96% 1%, 98% 0%, 100% 2%,
                              100% 98%, 98% 100%, 96% 98%, 94% 100%, 92% 99%, 90% 100%, 88% 98%, 86% 100%,
                              84% 99%, 82% 100%, 80% 98%, 78% 100%, 76% 99%, 74% 100%, 72% 98%, 70% 100%,
                              68% 99%, 66% 100%, 64% 98%, 62% 100%, 60% 99%, 58% 100%, 56% 98%, 54% 100%,
                              52% 99%, 50% 100%, 48% 98%, 46% 100%, 44% 99%, 42% 100%, 40% 98%, 38% 100%,
                              36% 99%, 34% 100%, 32% 98%, 30% 100%, 28% 99%, 26% 100%, 24% 98%, 22% 100%,
                              20% 99%, 18% 100%, 16% 98%, 14% 100%, 12% 99%, 10% 100%, 8% 98%, 6% 100%,
                              4% 99%, 2% 100%, 0% 98%,
                              0% 2%
                            )`
                          }}
                        >
                          {/* Paper texture overlay */}
                          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.3"/%3E%3C/svg%3E")',
                          }}></div>

                          <div className="relative z-10">
                            <div className="text-sm font-bold text-blue-700 uppercase mb-2 tracking-wider">
                              PSA 10 VALUE
                            </div>
                            <div className="text-5xl font-black text-blue-600 mb-2" style={{
                              textShadow: '2px 2px 4px rgba(37, 99, 235, 0.2)'
                            }}>
                              {formatCurrency(cardData.psa10Price)}
                            </div>
                            <div className="text-sm text-blue-800 font-semibold">
                              Gem Mint grade value
                            </div>
                          </div>

                          {/* Decorative corner tear */}
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-blue-200 to-cyan-200 opacity-60" style={{
                            clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                          }}></div>
                        </div>

                        {/* Value Multiplier - Spans 2 columns */}
                        <div
                          className="col-span-2 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-lg p-6 relative overflow-hidden"
                          style={{
                            boxShadow: '0 8px 16px rgba(124, 58, 237, 0.4), 0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
                          }}
                        >
                          {/* Animated background effect */}
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute inset-0" style={{
                              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                              animation: 'shimmer 3s infinite',
                            }}></div>
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-xs font-bold text-purple-100 uppercase tracking-wide mb-2">
                                  PSA 10 VALUE MULTIPLIER
                                </div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-6xl font-black text-white drop-shadow-lg">
                                    {cardData.rawPrice > 0
                                      ? (cardData.psa10Price / cardData.rawPrice).toFixed(1)
                                      : '0.0'}
                                  </span>
                                  <span className="text-4xl font-bold text-purple-100">x</span>
                                </div>
                                <div className="text-sm text-purple-100 mt-2 font-semibold">
                                  Grading to PSA 10 multiplies value by{' '}
                                  <span className="text-white font-bold">
                                    {cardData.rawPrice > 0
                                      ? (cardData.psa10Price / cardData.rawPrice).toFixed(1)
                                      : '0'}x
                                  </span>
                                </div>
                              </div>

                              {/* Icon/Badge */}
                              <div className="ml-4">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Additional context */}
                            <div className="mt-4 pt-4 border-t border-white/20">
                              <div className="flex items-center gap-2 text-xs text-purple-100">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">
                                  Every $1,000 invested becomes ${((cardData.psa10Price / cardData.rawPrice) * 1000).toLocaleString()} at PSA 10
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total Profit Estimate */}
                      <div
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300"
                        style={{
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-bold text-green-700 uppercase">
                            Total Profit Estimate
                          </div>
                          <div className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">
                            After Grading Costs
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {formatCurrency(cardData.totalProfitEstimate)}
                        </div>
                        <div className="text-xs text-green-700 space-y-1">
                          <div className="flex justify-between">
                            <span>PSA 10 Value:</span>
                            <span className="font-semibold">{formatCurrency(cardData.psa10Price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Raw Card Cost:</span>
                            <span className="font-semibold">-{formatCurrency(cardData.rawPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Grading Fee:</span>
                            <span className="font-semibold">-{formatCurrency(cardData.gradingCost)}</span>
                          </div>
                          <div className="pt-2 border-t border-green-300 flex justify-between font-bold text-sm">
                            <span>Net Profit:</span>
                            <span>{formatCurrency(cardData.totalProfitEstimate)}</span>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-white/60 rounded">
                          <p className="text-xs text-green-900">
                            <strong>Note:</strong> This assumes your card achieves a PSA 10 grade
                            (Success rate: {cardData.psa10GradeSuccess}%). Lower grades will result in lower returns.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Chart - Inside PSA Case */}
                  {cardData.rawPriceHistory && cardData.psa10PriceHistory && (
                    <div
                      className="mt-6 bg-white rounded-lg p-4 border-2 border-gray-300"
                      style={{
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                      }}
                    >
                      <PriceChart
                        rawPriceHistory={cardData.rawPriceHistory}
                        psa10PriceHistory={cardData.psa10PriceHistory}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sales History - Outside PSA Case */}
            {cardData.rawSalesHistory && cardData.psa10SalesHistory && (
              <div className="max-w-5xl mx-auto mt-8">
                <SalesHistory
                  rawSalesHistory={cardData.rawSalesHistory}
                  psa10SalesHistory={cardData.psa10SalesHistory}
                />
              </div>
            )}

            {/* Data Source & Affiliate Disclosure */}
            <div className="max-w-4xl mx-auto mt-8 space-y-3">
              {cardData.source && (
                <div className="text-center text-sm text-gray-500">
                  Data source: {cardData.source} • Last updated: {new Date(cardData.lastUpdated).toLocaleDateString()}
                </div>
              )}

              {/* Affiliate Disclosure (FTC Requirement) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-xs text-blue-900">
                    <strong className="font-semibold">Affiliate Disclosure:</strong> {EbayAffiliateService.getDisclosure()} This helps us keep UpGrade free and support our data services. You pay the same price, and we may earn a small commission.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPortfolioModal(false)
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {/* Close button */}
            <button
              onClick={() => setShowPortfolioModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add to Portfolio
              </h2>
              <p className="text-gray-600">
                {cardData?.name} - {cardData?.year} {cardData?.brand}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={portfolioQuantity}
                  onChange={(e) => setPortfolioQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-semibold text-gray-700 mb-2">
                  Purchase Price (per card)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                  <input
                    type="number"
                    id="purchasePrice"
                    min="0"
                    step="0.01"
                    value={portfolioPurchasePrice}
                    onChange={(e) => setPortfolioPurchasePrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Suggested: ${cardData?.rawPrice?.toFixed(2) || '0.00'} (current raw price)
                </p>
              </div>

              {/* Total Cost */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Total Cost</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${((parseFloat(portfolioPurchasePrice) || 0) * parseInt(portfolioQuantity || 1)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToPortfolio}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Add to Portfolio
              </button>

              <button
                onClick={() => setShowPortfolioModal(false)}
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
