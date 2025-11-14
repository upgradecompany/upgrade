'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CardService } from '../../lib/CardService'
import PriceChart from '../../components/PriceChart'
import SalesHistory from '../../components/SalesHistory'

export default function CardPage() {
  const [playerName, setPlayerName] = useState('')
  const [year, setYear] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [brand, setBrand] = useState('')
  const [loading, setLoading] = useState(false)
  const [cardData, setCardData] = useState(null)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!playerName.trim()) {
      setError('Please enter a player name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await CardService.searchCard({
        playerName: playerName.trim(),
        year: year.trim(),
        cardNumber: cardNumber.trim(),
        brand: brand.trim(),
      })
      setCardData(data)
    } catch (err) {
      setError('Failed to fetch card data. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-3xl font-bold">
              <span className="text-blue-600">Up</span>
              <span className="text-gray-800">Grade</span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!cardData ? (
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
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g., Tom Brady"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2000"
                      maxLength="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="156"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand/Set
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Topps Chrome"
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
                      Analyzing...
                    </span>
                  ) : (
                    'Analyze Card'
                  )}
                </button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-semibold mb-2">💡 Try These:</p>
                <p className="text-xs text-blue-800">
                  Tom Brady, LeBron James, Michael Jordan, or Patrick Mahomes
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Card Results
          <div className="space-y-8">
            {/* Card Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{cardData.name}</h1>
                <p className="text-lg text-gray-600 mt-1">
                  {cardData.year} {cardData.brand} #{cardData.cardNumber}
                </p>
              </div>
              <button
                onClick={() => setCardData(null)}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all"
              >
                New Search
              </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Card Image */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="aspect-[2/3] relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
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
                    {/* PSA 10 Badge */}
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                      PSA 10
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Display */}
              <div className="lg:col-span-2 space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Raw Card Value */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-400">
                    <div className="text-sm font-semibold text-gray-500 uppercase mb-2">
                      Raw Card Value
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {formatCurrency(cardData.rawPrice)}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Current market value
                    </div>
                  </div>

                  {/* PSA 10 Value */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
                    <div className="text-sm font-semibold text-blue-600 uppercase mb-2">
                      PSA 10 Value
                    </div>
                    <div className="text-4xl font-bold text-blue-600">
                      {formatCurrency(cardData.psa10Price)}
                    </div>
                    <div className="text-xs text-blue-700 mt-2">
                      Gem Mint grade value
                    </div>
                  </div>

                  {/* PSA 10 Pop Count */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-sm font-semibold text-gray-700 uppercase mb-2">
                      PSA 10 Pop Count
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {cardData.psa10PopCount?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Total PSA 10s graded
                    </div>
                  </div>

                  {/* PSA 10 Grade Success */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-sm font-semibold text-gray-700 uppercase mb-2">
                      PSA 10 Success Rate
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {cardData.psa10GradeSuccess}%
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Chance of getting PSA 10
                    </div>
                  </div>
                </div>

                {/* Total Profit Estimate */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-green-700 uppercase">
                      Total Profit Estimate
                    </div>
                    <div className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-semibold">
                      After Grading Costs
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {formatCurrency(cardData.totalProfitEstimate)}
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
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
                    <div className="pt-2 border-t border-green-300 flex justify-between font-bold text-base">
                      <span>Net Profit:</span>
                      <span>{formatCurrency(cardData.totalProfitEstimate)}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-green-900">
                      <strong>Note:</strong> This assumes your card achieves a PSA 10 grade
                      (Success rate: {cardData.psa10GradeSuccess}%). Lower grades will result in lower returns.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Chart */}
            {cardData.rawPriceHistory && cardData.psa10PriceHistory && (
              <PriceChart
                rawPriceHistory={cardData.rawPriceHistory}
                psa10PriceHistory={cardData.psa10PriceHistory}
              />
            )}

            {/* Sales History */}
            {cardData.rawSalesHistory && cardData.psa10SalesHistory && (
              <SalesHistory
                rawSalesHistory={cardData.rawSalesHistory}
                psa10SalesHistory={cardData.psa10SalesHistory}
              />
            )}

            {/* Data Source */}
            {cardData.source && (
              <div className="text-center text-sm text-gray-500">
                Data source: {cardData.source} • Last updated: {new Date(cardData.lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
