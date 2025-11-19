'use client'

import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { EbayAffiliateService } from '@/lib/EbayAffiliateService'
import SignupModal from '@/components/SignupModal'

export default function TheListPage() {
  const [topCards, setTopCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showSignupModal, setShowSignupModal] = useState(false)
  const { user, isTrialActive, getDaysLeftInTrial } = useAuth()

  const FREE_CARD_LIMIT = 3 // Show first 3 cards for free

  useEffect(() => {
    // Calculate top 20 cards by profit margin
    const cards = [
      {
        rank: 1,
        id: 'michael-jordan-1986-fleer',
        name: 'Michael Jordan',
        year: '1986',
        brand: 'Fleer',
        cardNumber: '57',
        sport: 'Basketball',
        rawPrice: 3000,
        psa10Price: 150000,
        gradingCost: 100,
        psa10Success: 2.1,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27814806.jpg?aspect=fit&height=800',
      },
      {
        rank: 2,
        id: 'lebron-james-2003-chrome',
        name: 'LeBron James',
        year: '2003',
        brand: 'Topps Chrome',
        cardNumber: '111',
        sport: 'Basketball',
        rawPrice: 5000,
        psa10Price: 75000,
        gradingCost: 100,
        psa10Success: 8.2,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/37275401.jpg?aspect=fit&height=800',
      },
      {
        rank: 3,
        id: 'tom-brady-2000-chrome',
        name: 'Tom Brady',
        year: '2000',
        brand: 'Topps Chrome',
        cardNumber: '156',
        sport: 'Football',
        rawPrice: 2500,
        psa10Price: 25000,
        gradingCost: 100,
        psa10Success: 12.5,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/27902156.jpg?aspect=fit&height=800',
      },
      {
        rank: 4,
        id: 'lebron-james-2003-ud',
        name: 'LeBron James',
        year: '2003',
        brand: 'Upper Deck',
        cardNumber: '301',
        sport: 'Basketball',
        rawPrice: 3500,
        psa10Price: 45000,
        gradingCost: 100,
        psa10Success: 11.3,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/31653012.jpg?aspect=fit&height=800',
      },
      {
        rank: 5,
        id: 'tom-brady-2000-bowman',
        name: 'Tom Brady',
        year: '2000',
        brand: 'Bowman Chrome',
        cardNumber: '236',
        sport: 'Football',
        rawPrice: 1800,
        psa10Price: 18000,
        gradingCost: 100,
        psa10Success: 14.2,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/28156236.jpg?aspect=fit&height=800',
      },
      {
        rank: 6,
        id: 'patrick-mahomes-2017-prizm',
        name: 'Patrick Mahomes',
        year: '2017',
        brand: 'Panini Prizm',
        cardNumber: '127',
        sport: 'Football',
        rawPrice: 1500,
        psa10Price: 15000,
        gradingCost: 100,
        psa10Success: 18.7,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/42617127.jpg?aspect=fit&height=800',
      },
      {
        rank: 7,
        id: 'kobe-bryant-1996-chrome',
        name: 'Kobe Bryant',
        year: '1996',
        brand: 'Topps Chrome',
        cardNumber: '138',
        sport: 'Basketball',
        rawPrice: 2200,
        psa10Price: 35000,
        gradingCost: 100,
        psa10Success: 5.3,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/25896138.jpg?aspect=fit&height=800',
      },
      {
        rank: 8,
        id: 'luka-doncic-2018-prizm',
        name: 'Luka Doncic',
        year: '2018',
        brand: 'Panini Prizm',
        cardNumber: '280',
        sport: 'Basketball',
        rawPrice: 800,
        psa10Price: 12000,
        gradingCost: 100,
        psa10Success: 22.1,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/43418280.jpg?aspect=fit&height=800',
      },
      {
        rank: 9,
        id: 'mike-trout-2011-update',
        name: 'Mike Trout',
        year: '2011',
        brand: 'Topps Update',
        cardNumber: 'US175',
        sport: 'Baseball',
        rawPrice: 1200,
        psa10Price: 18000,
        gradingCost: 100,
        psa10Success: 15.4,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/36411175.jpg?aspect=fit&height=800',
      },
      {
        rank: 10,
        id: 'shohei-ohtani-2018-chrome',
        name: 'Shohei Ohtani',
        year: '2018',
        brand: 'Topps Chrome',
        cardNumber: '700',
        sport: 'Baseball',
        rawPrice: 600,
        psa10Price: 8500,
        gradingCost: 100,
        psa10Success: 19.8,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/42918700.jpg?aspect=fit&height=800',
      },
      {
        rank: 11,
        id: 'giannis-2013-prizm',
        name: 'Giannis Antetokounmpo',
        year: '2013',
        brand: 'Panini Prizm',
        cardNumber: '290',
        sport: 'Basketball',
        rawPrice: 900,
        psa10Price: 12500,
        gradingCost: 100,
        psa10Success: 17.2,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/38513290.jpg?aspect=fit&height=800',
      },
      {
        rank: 12,
        id: 'justin-herbert-2020-prizm',
        name: 'Justin Herbert',
        year: '2020',
        brand: 'Panini Prizm',
        cardNumber: '325',
        sport: 'Football',
        rawPrice: 400,
        psa10Price: 5500,
        gradingCost: 100,
        psa10Success: 24.5,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/45120325.jpg?aspect=fit&height=800',
      },
      {
        rank: 13,
        id: 'zion-2019-prizm',
        name: 'Zion Williamson',
        year: '2019',
        brand: 'Panini Prizm',
        cardNumber: '248',
        sport: 'Basketball',
        rawPrice: 550,
        psa10Price: 7800,
        gradingCost: 100,
        psa10Success: 21.3,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/44519248.jpg?aspect=fit&height=800',
      },
      {
        rank: 14,
        id: 'aaron-judge-2017-chrome',
        name: 'Aaron Judge',
        year: '2017',
        brand: 'Topps Chrome',
        cardNumber: '169',
        sport: 'Baseball',
        rawPrice: 380,
        psa10Price: 5200,
        gradingCost: 100,
        psa10Success: 23.1,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/42217169.jpg?aspect=fit&height=800',
      },
      {
        rank: 15,
        id: 'joe-burrow-2020-prizm',
        name: 'Joe Burrow',
        year: '2020',
        brand: 'Panini Prizm',
        cardNumber: '301',
        sport: 'Football',
        rawPrice: 320,
        psa10Price: 4500,
        gradingCost: 100,
        psa10Success: 26.2,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/45120301.jpg?aspect=fit&height=800',
      },
      {
        rank: 16,
        id: 'ronald-acuna-2018-chrome',
        name: 'Ronald Acuna Jr.',
        year: '2018',
        brand: 'Topps Chrome',
        cardNumber: '193',
        sport: 'Baseball',
        rawPrice: 290,
        psa10Price: 4000,
        gradingCost: 100,
        psa10Success: 25.8,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/43218193.jpg?aspect=fit&height=800',
      },
      {
        rank: 17,
        id: 'ja-morant-2019-prizm',
        name: 'Ja Morant',
        year: '2019',
        brand: 'Panini Prizm',
        cardNumber: '249',
        sport: 'Basketball',
        rawPrice: 270,
        psa10Price: 3800,
        gradingCost: 100,
        psa10Success: 27.4,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/44519249.jpg?aspect=fit&height=800',
      },
      {
        rank: 18,
        id: 'tatis-2019-chrome',
        name: 'Fernando Tatis Jr.',
        year: '2019',
        brand: 'Topps Chrome',
        cardNumber: '410',
        sport: 'Baseball',
        rawPrice: 250,
        psa10Price: 3500,
        gradingCost: 100,
        psa10Success: 28.1,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/44219410.jpg?aspect=fit&height=800',
      },
      {
        rank: 19,
        id: 'cj-stroud-2023-prizm',
        name: 'CJ Stroud',
        year: '2023',
        brand: 'Panini Prizm',
        cardNumber: '301',
        sport: 'Football',
        rawPrice: 180,
        psa10Price: 2800,
        gradingCost: 100,
        psa10Success: 32.5,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/47623301.jpg?aspect=fit&height=800',
      },
      {
        rank: 20,
        id: 'wembanyama-2023-prizm',
        name: 'Victor Wembanyama',
        year: '2023',
        brand: 'Panini Prizm',
        cardNumber: '1',
        sport: 'Basketball',
        rawPrice: 220,
        psa10Price: 3200,
        gradingCost: 100,
        psa10Success: 30.2,
        imageUrl: 'https://images.psacard.com/s3/cu-psa/autoimages/47623001.jpg?aspect=fit&height=800',
      },
    ]

    // Calculate profit margin and expected value for each card
    const cardsWithProfit = cards.map(card => {
      const maxProfit = card.psa10Price - card.rawPrice - card.gradingCost
      const expectedValue = (card.psa10Price * (card.psa10Success / 100)) - card.rawPrice - card.gradingCost
      const profitMargin = ((maxProfit / card.rawPrice) * 100).toFixed(1)

      return {
        ...card,
        maxProfit,
        expectedValue: expectedValue.toFixed(0),
        profitMargin,
      }
    })

    // Sort by max profit (already sorted in mock data)
    setTopCards(cardsWithProfit)
    setFilteredCards(cardsWithProfit) // Initially show all cards
  }, [])

  // Filter cards when filter changes
  useEffect(() => {
    let filtered = [...topCards]

    switch (selectedFilter) {
      case 'under50':
        filtered = topCards.filter(card => card.rawPrice < 50)
        break
      case 'under200':
        filtered = topCards.filter(card => card.rawPrice < 200)
        break
      case 'under500':
        filtered = topCards.filter(card => card.rawPrice < 500)
        break
      case 'under2000':
        filtered = topCards.filter(card => card.rawPrice < 2000)
        break
      case 'over2000':
        filtered = topCards.filter(card => card.rawPrice >= 2000)
        break
      default:
        filtered = topCards
    }

    setFilteredCards(filtered)
  }, [selectedFilter, topCards])

  const formatCurrency = (value) => {
    return `$${parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  const getSportIcon = (sport) => {
    switch(sport) {
      case 'Basketball': return '🏀'
      case 'Football': return '🏈'
      case 'Baseball': return '⚾'
      default: return '🏆'
    }
  }

  const hasAccess = user && isTrialActive()

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fredericka+the+Great&family=Abril+Fatface&display=swap"
          rel="stylesheet"
        />
      </Head>
      <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
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
            <div className="text-gray-700 font-bold text-lg">
              THE LIST
            </div>
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
        {/* Trial Status Banner */}
        {user && isTrialActive() && (
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
                    {getDaysLeftInTrial()} days left in your free trial
                  </p>
                  <p className="text-blue-100 text-sm">
                    Enjoying THE LIST? Upgrade to keep access to all 20 profitable cards!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSignupModal(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            THE <span className="text-blue-600">LIST</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Top 20 raw cards with the highest profit potential if graded PSA 10
          </p>
          <div className="mt-4 inline-block bg-blue-100 px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-bold text-gray-900">RAW CARDS</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Cards
              </button>
              <button
                onClick={() => setSelectedFilter('under50')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedFilter === 'under50'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Under $50
              </button>
              <button
                onClick={() => setSelectedFilter('under200')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedFilter === 'under200'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Under $200
              </button>
              <button
                onClick={() => setSelectedFilter('under500')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedFilter === 'under500'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Under $500
              </button>
              <button
                onClick={() => setSelectedFilter('under2000')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedFilter === 'under2000'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Under $2,000
              </button>
              <button
                onClick={() => setSelectedFilter('over2000')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedFilter === 'over2000'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Over $2,000
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Showing <strong className="text-blue-600">{filteredCards.length}</strong> cards
            </p>
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-4">
          {filteredCards.length > 0 ? (
            filteredCards.map((card, index) => {
              const isLocked = index >= FREE_CARD_LIMIT && !hasAccess
              return (
            <div
              key={card.rank}
              className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 relative ${
                isLocked ? 'border-yellow-400' : 'border-gray-100 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-6">
                {/* Rank - Jersey Number Style */}
                <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center relative">
                  {/* Outer white border layer */}
                  <span
                    className="text-7xl font-black absolute"
                    style={{
                      fontFamily: 'Impact, "Arial Black", sans-serif',
                      color: '#fff',
                      WebkitTextStroke: '8px #fff',
                      paintOrder: 'stroke fill',
                    }}
                  >
                    {card.rank}
                  </span>
                  {/* Middle black outline */}
                  <span
                    className="text-7xl font-black absolute"
                    style={{
                      fontFamily: 'Impact, "Arial Black", sans-serif',
                      color: '#000',
                      WebkitTextStroke: '5px #000',
                      paintOrder: 'stroke fill',
                    }}
                  >
                    {card.rank}
                  </span>
                  {/* Inner white outline */}
                  <span
                    className="text-7xl font-black absolute"
                    style={{
                      fontFamily: 'Impact, "Arial Black", sans-serif',
                      color: '#000',
                      WebkitTextStroke: '3px #fff',
                      paintOrder: 'stroke fill',
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                    }}
                  >
                    {card.rank}
                  </span>
                  {/* Main black number */}
                  <span
                    className="text-7xl font-black relative"
                    style={{
                      fontFamily: 'Impact, "Arial Black", sans-serif',
                      color: '#000',
                    }}
                  >
                    {card.rank}
                  </span>
                </div>

                {/* Sport Icon */}
                <div className="flex-shrink-0 text-5xl">
                  {getSportIcon(card.sport)}
                </div>

                {/* Card Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-32 bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={card.imageUrl}
                      alt={`${card.name} ${card.year} ${card.brand}`}
                      width={96}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Card Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{card.name}</h3>
                  <p className="text-gray-600">
                    {card.year} {card.brand} #{card.cardNumber}
                  </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 font-semibold uppercase">Raw Price</div>
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(card.rawPrice)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-blue-600 font-semibold uppercase">PSA 10</div>
                    <div className="text-lg font-bold text-blue-600">{formatCurrency(card.psa10Price)}</div>
                  </div>
                </div>

                {/* Profit Info */}
                <div className="flex-shrink-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg px-6 py-4 border-2 border-green-300 min-w-[200px]">
                  <div className="text-xs text-green-700 font-bold uppercase mb-1">Max Profit</div>
                  <div className="text-3xl font-bold text-green-600 mb-1">{formatCurrency(card.maxProfit)}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">
                      {card.profitMargin}% margin
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                      {card.psa10Success}% PSA 10
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex flex-col gap-2 min-w-[140px]">
                  <Link
                    href={`/card?id=${card.id}`}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-xs font-bold">View Details</span>
                  </Link>
                  <a
                    href={EbayAffiliateService.generateRawCardLink(`${card.name} ${card.year} ${card.brand}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 border-[3px] border-red-500 hover:border-red-600 px-4 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl"
                    style={{
                      boxShadow: '0 6px 12px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.9)'
                    }}
                    title="Buy Raw Card on eBay"
                  >
                    <svg className="h-4" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <text x="10" y="80" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="80">
                        <tspan fill="#E53238">e</tspan>
                        <tspan fill="#0064D2">B</tspan>
                        <tspan fill="#F5AF02">a</tspan>
                        <tspan fill="#86B817">y</tspan>
                      </text>
                    </svg>
                    <span className="text-xs text-red-600 font-bold">RAW</span>
                  </a>
                  <a
                    href={EbayAffiliateService.generatePSA10Link(`${card.name} ${card.year} ${card.brand}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 border-[3px] border-red-500 hover:border-red-600 px-4 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl"
                    style={{
                      boxShadow: '0 6px 12px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.9)'
                    }}
                    title="Buy PSA 10 on eBay"
                  >
                    <svg className="h-4" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <text x="10" y="80" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="80">
                        <tspan fill="#E53238">e</tspan>
                        <tspan fill="#0064D2">B</tspan>
                        <tspan fill="#F5AF02">a</tspan>
                        <tspan fill="#86B817">y</tspan>
                      </text>
                    </svg>
                    <span className="text-xs text-red-600 font-bold">PSA 10</span>
                  </a>
                </div>
              </div>

              {/* Blur Overlay for Locked Cards */}
              {isLocked && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="mb-4">
                      <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {!user ? 'Start Your Free Trial' : 'Trial Expired'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {!user
                        ? 'Sign up for 14 days of free access to all 20 cards'
                        : 'Upgrade to premium to see all profitable cards'}
                    </p>
                    <button
                      onClick={() => setShowSignupModal(true)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                    >
                      {!user ? 'Start Free Trial' : 'Upgrade Now'}
                    </button>
                  </div>
                </div>
              )}
            </div>
              )
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-xl text-gray-600 mb-4">No cards found in this price range</p>
              <button
                onClick={() => setSelectedFilter('all')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                View All Cards
              </button>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Want to analyze your own card?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Search any sports card to see if it's worth grading
          </p>
          <Link
            href="/card"
            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition-all shadow-lg"
          >
            Search Cards
          </Link>
        </div>
      </main>
      </div>
    </>
  )
}
