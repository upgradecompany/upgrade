'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export default function Dashboard() {
  const router = useRouter()
  const {
    user,
    loading,
    logout,
    isTrialActive,
    getDaysLeftInTrial,
    removeFromWatchlist,
    removeFromPortfolio,
  } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const watchlist = user.watchlist || []
  const portfolio = user.portfolio || []
  const trialActive = isTrialActive()
  const daysLeft = getDaysLeftInTrial()

  const formatCurrency = (value) => {
    return `$${parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, card) => {
      return total + (card.psa10Price || 0) * (card.quantity || 1)
    }, 0)
  }

  const calculatePortfolioCost = () => {
    return portfolio.reduce((total, card) => {
      return total + (card.purchasePrice || 0) * (card.quantity || 1)
    }, 0)
  }

  const portfolioValue = calculatePortfolioValue()
  const portfolioCost = calculatePortfolioCost()
  const portfolioGain = portfolioValue - portfolioCost

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-3xl font-bold">
              <span className="text-blue-600">Up</span>
              <span className="text-gray-800">Grade</span>
            </Link>
            <Link
              href="/list"
              className="text-gray-700 hover:text-blue-600 font-bold text-lg transition-colors"
            >
              THE LIST
            </Link>
            <Link
              href="/card"
              className="text-gray-700 hover:text-blue-600 font-bold text-lg transition-colors"
            >
              Search Cards
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-semibold">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-red-600 font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-xl text-gray-600">
            Here's your card collection dashboard
          </p>
        </div>

        {/* Trial Status */}
        {user.isPremium ? (
          <div className="mb-8 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">Premium Member</p>
                <p className="text-green-100 text-sm">
                  You have unlimited access to all features!
                </p>
              </div>
            </div>
          </div>
        ) : trialActive ? (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {daysLeft} days left in your free trial
                  </p>
                  <p className="text-blue-100 text-sm">
                    Upgrade now to keep full access to all features!
                  </p>
                </div>
              </div>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all">
                Upgrade to Premium
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg">Your trial has expired</p>
                  <p className="text-red-100 text-sm">
                    Upgrade to premium to continue accessing all features
                  </p>
                </div>
              </div>
              <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition-all">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 font-semibold uppercase mb-2">Portfolio Value</div>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(portfolioValue)}</div>
            <div className="text-xs text-gray-500 mt-1">{portfolio.length} cards</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 font-semibold uppercase mb-2">Total Cost</div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(portfolioCost)}</div>
            <div className="text-xs text-gray-500 mt-1">Purchase price</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 font-semibold uppercase mb-2">
              {portfolioGain >= 0 ? 'Profit' : 'Loss'}
            </div>
            <div className={`text-3xl font-bold ${portfolioGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioGain >= 0 ? '+' : ''}{formatCurrency(portfolioGain)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {portfolioCost > 0 ? `${((portfolioGain / portfolioCost) * 100).toFixed(1)}% ROI` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Watchlist */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Watchlist ({watchlist.length})
            </h2>
            <Link
              href="/list"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Browse THE LIST →
            </Link>
          </div>
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchlist.map((card) => (
                <div key={card.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{card.name}</h3>
                      <p className="text-sm text-gray-600">
                        {card.year} {card.brand} #{card.cardNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromWatchlist(card.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Raw Price</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(card.rawPrice)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-600 uppercase">PSA 10</div>
                      <div className="text-lg font-bold text-blue-600">{formatCurrency(card.psa10Price)}</div>
                    </div>
                  </div>
                  <Link
                    href={`/card?id=${card.id}`}
                    className="mt-4 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-xl text-gray-600 mb-4">Your watchlist is empty</p>
              <Link
                href="/list"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Browse Cards
              </Link>
            </div>
          )}
        </div>

        {/* Portfolio */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Portfolio ({portfolio.length})
          </h2>
          {portfolio.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Card</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Purchase Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Current Value</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Gain/Loss</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolio.map((card) => {
                    const cost = (card.purchasePrice || 0) * (card.quantity || 1)
                    const value = (card.psa10Price || 0) * (card.quantity || 1)
                    const gain = value - cost
                    return (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{card.name}</div>
                          <div className="text-sm text-gray-600">
                            {card.year} {card.brand}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{card.quantity || 1}</td>
                        <td className="px-6 py-4 text-gray-900">{formatCurrency(card.purchasePrice || 0)}</td>
                        <td className="px-6 py-4 text-blue-600 font-semibold">{formatCurrency(card.psa10Price || 0)}</td>
                        <td className={`px-6 py-4 font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => removeFromPortfolio(card.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-xl text-gray-600 mb-4">Your portfolio is empty</p>
              <p className="text-gray-500 mb-6">Start tracking your card collection here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
