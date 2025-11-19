'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function SignupModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { signup } = useAuth()

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    // Sign up user
    signup(name.trim(), email.trim())

    // Close modal
    onClose()

    // Reset form
    setName('')
    setEmail('')
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold mb-2">
            <span className="text-blue-600">Up</span>
            <span className="text-gray-800">Grade</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Start Your Free Trial
          </h2>
          <p className="text-gray-600">
            Get 14 days of full access to THE LIST and all premium features
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Access to all 20 top profit cards</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Unlimited card searches & analysis</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Full pricing data & profit calculations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">No credit card required</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="john@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Start My Free Trial
          </button>

          <p className="text-xs text-gray-500 text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy.
            Your trial lasts 14 days with full access to all features.
          </p>
        </form>
      </div>
    </div>
  )
}
