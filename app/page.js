'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import SignupModal from '@/components/SignupModal'
import LoginModal from '@/components/LoginModal'

export default function Home() {
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, logout } = useAuth()

  const handleGetStarted = (e) => {
    if (!user) {
      e.preventDefault()
      setShowSignupModal(true)
    }
  }

  return (
    <>
      <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => setShowSignupModal(true)}
      />
      <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="text-3xl font-bold text-blue-600">
              <span className="text-blue-600">Up</span>
              <span className="text-gray-800">Grade</span>
            </div>
            <Link
              href="/list"
              className="text-gray-700 hover:text-blue-600 font-bold text-lg transition-colors"
            >
              THE LIST
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-red-600 font-semibold transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Start Free Trial
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Cards */}
      <section className="relative pt-12 pb-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main heading */}
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-2xl md:text-3xl font-bold text-gray-900">
                Don't just grade...
              </span>
              <span className="text-2xl md:text-3xl font-bold text-blue-600 ml-2">
                UpGrade!
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Make Smarter
              <span className="text-blue-600"> Grading Decisions</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See <strong className="font-bold text-gray-900">RAW vs PSA 10</strong> values, success rates, and profit potential for more confident grading
            </p>
          </div>

          {/* Dashboard Screenshot with Floating Cards */}
          <div className="relative max-w-6xl mx-auto">
            {/* Left Card */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 transform -rotate-12 hidden lg:block z-10">
              <div className="w-48 h-72 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-2xl p-4">
                <div className="w-full h-full bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-2">🏀</div>
                    <div className="font-bold text-lg">LeBron James</div>
                    <div className="text-sm opacity-90">2003 Topps Chrome</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 transform rotate-12 hidden lg:block z-10">
              <div className="w-48 h-72 bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-2xl p-4">
                <div className="w-full h-full bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-2">🏈</div>
                    <div className="font-bold text-lg">Patrick Mahomes</div>
                    <div className="text-sm opacity-90">2017 Panini Prizm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Central Browser Frame with Screenshot */}
            <div className="relative z-20 bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-gray-800">
              {/* Browser Chrome */}
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-gray-400 text-sm ml-4">
                  upgrade.app/card
                </div>
              </div>

              {/* Screenshot Content */}
              <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 p-8">
                <div className="grid grid-cols-3 gap-6">
                  {/* Card Image Section */}
                  <div className="col-span-1">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="aspect-[2/3] bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="text-6xl mb-2">🏈</div>
                          <div className="font-bold text-xl">Tom Brady</div>
                          <div className="text-sm mt-1">2000 Topps Chrome</div>
                        </div>
                      </div>
                      <div className="mt-3 bg-blue-600 text-white text-center py-1 rounded-full text-xs font-bold">
                        PSA 10
                      </div>
                    </div>
                  </div>

                  {/* Data Section */}
                  <div className="col-span-2 space-y-4">
                    {/* Price Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
                        <div className="text-xs text-gray-500 font-semibold mb-1">RAW CARD VALUE</div>
                        <div className="text-2xl font-bold text-gray-900">$2,500</div>
                      </div>
                      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
                        <div className="text-xs text-blue-600 font-semibold mb-1">PSA 10 VALUE</div>
                        <div className="text-2xl font-bold text-blue-600">$25,000</div>
                      </div>
                      <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-xs text-gray-700 font-semibold mb-1">PSA 10 POP</div>
                        <div className="text-2xl font-bold text-gray-900">1,847</div>
                      </div>
                      <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-xs text-gray-700 font-semibold mb-1">SUCCESS RATE</div>
                        <div className="text-2xl font-bold text-gray-900">12.5%</div>
                      </div>
                    </div>

                    {/* Profit Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-4 border-2 border-green-300">
                      <div className="text-xs text-green-700 font-bold mb-1">TOTAL PROFIT ESTIMATE</div>
                      <div className="text-3xl font-bold text-green-600">$22,400</div>
                    </div>

                    {/* Mini Chart */}
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="text-xs text-gray-700 font-semibold mb-2">90-DAY PRICE TREND</div>
                      <div className="flex items-end justify-between h-16 gap-1">
                        {[40, 45, 42, 50, 48, 55, 52, 58, 60, 62, 65, 70].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            {user ? (
              <Link
                href="/card"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Analyze Your Card Now
              </Link>
            ) : (
              <button
                onClick={() => setShowSignupModal(true)}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Start Free Trial - Analyze Cards
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Why UpGrade Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            WHY UPGRADE?
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">REAL MARKET DATA</h3>
              <p className="text-blue-100 leading-relaxed">
                Live pricing from eBay sold listings, PWCC, Goldin, and major marketplaces. See what cards actually sell for, not estimates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">COMPREHENSIVE ANALYSIS</h3>
              <p className="text-blue-100 leading-relaxed">
                See PSA 10 pop counts, success rates, 90-day price trends, and last 20 sales. Everything you need to make the right decision.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">PROFIT CALCULATOR</h3>
              <p className="text-blue-100 leading-relaxed">
                Know exactly what you'll make after grading costs. See if grading makes financial sense before you spend $100+.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Make Smarter Grading Decisions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of collectors who use UpGrade to maximize their ROI
          </p>
          {user ? (
            <Link
              href="/card"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-xl text-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
            </Link>
          ) : (
            <button
              onClick={() => setShowSignupModal(true)}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-xl text-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Start Your 14-Day Free Trial
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl font-bold mb-4">
            <span className="text-blue-400">Up</span>
            <span className="text-white">Grade</span>
          </div>
          <p>Making card grading decisions easier, one card at a time.</p>
          <div className="mt-8 text-sm text-gray-500">
            © 2025 UpGrade. All rights reserved.
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
