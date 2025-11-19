'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    checkUser()

    // Subscribe to auth changes
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await loadUserProfile(session.user.id)
          } else {
            setUser(null)
          }
        }
      )

      return () => {
        authListener?.subscription?.unsubscribe()
      }
    }
  }, [])

  // Check current user session
  const checkUser = async () => {
    try {
      if (!supabase) {
        // Fallback to localStorage if Supabase not configured
        const storedUser = localStorage.getItem('upgradeUser')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await loadUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load user profile from database
  const loadUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error.message, error.details, error.hint)
        throw error
      }

      // Load watchlist
      const { data: watchlistData } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId)

      // Load portfolio
      const { data: portfolioData } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', userId)

      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        signupDate: profile.signup_date,
        trialEndDate: profile.trial_end_date,
        isPremium: profile.is_premium,
        premiumSince: profile.premium_since,
        watchlist: watchlistData?.map(item => ({
          ...item.card_data,
          addedDate: item.added_date
        })) || [],
        portfolio: portfolioData?.map(item => ({
          ...item.card_data,
          quantity: item.quantity,
          purchasePrice: item.purchase_price,
          addedDate: item.added_date
        })) || []
      })
    } catch (error) {
      console.error('Error loading user profile:', error)
      throw error
    }
  }

  const signup = async (name, email) => {
    try {
      if (!supabase) {
        // Fallback to localStorage
        const userData = {
          name,
          email,
          signupDate: new Date().toISOString(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          isPremium: false,
          watchlist: [],
          portfolio: [],
        }
        localStorage.setItem('upgradeUser', JSON.stringify(userData))
        setUser(userData)
        return userData
      }

      // Create a random password for now (you can add password input later)
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            name: name
          },
          emailRedirectTo: window.location.origin
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        throw authError
      }

      console.log('Signup response:', authData)

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        console.warn('Email confirmation required. User needs to check their email.')
        throw new Error('Please check your email to confirm your account before logging in.')
      }

      // If we have a session, the user is confirmed
      if (authData.user && authData.session) {
        // Profile is automatically created by database trigger
        // Wait a moment for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
          // Load the profile
          await loadUserProfile(authData.user.id)
        } catch (profileError) {
          console.error('Profile loading failed:', profileError)
          // Profile might not exist yet - try creating it manually
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              name: name
            })

          if (insertError) {
            console.error('Manual profile creation error:', insertError)
          } else {
            // Try loading again
            await loadUserProfile(authData.user.id)
          }
        }
      }

      return user
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const login = async (email) => {
    try {
      if (!supabase) {
        // Fallback to localStorage
        const storedUser = localStorage.getItem('upgradeUser')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          if (userData.email === email) {
            setUser(userData)
            return { success: true, user: userData }
          }
        }
        return { success: false, error: 'No account found with this email' }
      }

      // For now, we'll use a magic link (passwordless) login
      // This sends an email with a login link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      })

      if (error) throw error

      return {
        success: true,
        message: 'Check your email for the login link!'
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const addToWatchlist = async (card) => {
    if (!user) return

    try {
      if (!supabase) {
        // Fallback to localStorage
        const updatedUser = {
          ...user,
          watchlist: [...(user.watchlist || []), { ...card, addedDate: new Date().toISOString() }],
        }
        localStorage.setItem('upgradeUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return
      }

      // Add to Supabase
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          card_id: card.id,
          card_data: card
        })

      if (error) throw error

      // Reload user data
      await loadUserProfile(user.id)
    } catch (error) {
      console.error('Add to watchlist error:', error)
      throw error
    }
  }

  const removeFromWatchlist = async (cardId) => {
    if (!user) return

    try {
      if (!supabase) {
        // Fallback to localStorage
        const updatedUser = {
          ...user,
          watchlist: (user.watchlist || []).filter((c) => c.id !== cardId),
        }
        localStorage.setItem('upgradeUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return
      }

      // Remove from Supabase
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('card_id', cardId)

      if (error) throw error

      // Reload user data
      await loadUserProfile(user.id)
    } catch (error) {
      console.error('Remove from watchlist error:', error)
      throw error
    }
  }

  const addToPortfolio = async (card, quantity = 1, purchasePrice = 0) => {
    if (!user) return

    try {
      if (!supabase) {
        // Fallback to localStorage
        const portfolioItem = {
          ...card,
          quantity,
          purchasePrice,
          addedDate: new Date().toISOString(),
        }
        const updatedUser = {
          ...user,
          portfolio: [...(user.portfolio || []), portfolioItem],
        }
        localStorage.setItem('upgradeUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return
      }

      // Add to Supabase
      const { error } = await supabase
        .from('portfolio')
        .insert({
          user_id: user.id,
          card_id: card.id,
          card_data: card,
          quantity: quantity,
          purchase_price: purchasePrice
        })

      if (error) throw error

      // Reload user data
      await loadUserProfile(user.id)
    } catch (error) {
      console.error('Add to portfolio error:', error)
      throw error
    }
  }

  const removeFromPortfolio = async (cardId) => {
    if (!user) return

    try {
      if (!supabase) {
        // Fallback to localStorage
        const updatedUser = {
          ...user,
          portfolio: (user.portfolio || []).filter((c) => c.id !== cardId),
        }
        localStorage.setItem('upgradeUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return
      }

      // Remove from Supabase
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('user_id', user.id)
        .eq('card_id', cardId)

      if (error) throw error

      // Reload user data
      await loadUserProfile(user.id)
    } catch (error) {
      console.error('Remove from portfolio error:', error)
      throw error
    }
  }

  const isInWatchlist = (cardId) => {
    if (!user || !user.watchlist) return false
    return user.watchlist.some((c) => c.id === cardId)
  }

  const isInPortfolio = (cardId) => {
    if (!user || !user.portfolio) return false
    return user.portfolio.some((c) => c.id === cardId)
  }

  const isTrialActive = () => {
    if (!user) return false
    if (user.isPremium) return true

    const now = new Date()
    const trialEnd = new Date(user.trialEndDate)
    return now < trialEnd
  }

  const getDaysLeftInTrial = () => {
    if (!user) return 0
    if (user.isPremium) return Infinity

    const now = new Date()
    const trialEnd = new Date(user.trialEndDate)
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysLeft)
  }

  const upgradeToPremium = async () => {
    if (!user) return

    try {
      if (!supabase) {
        // Fallback to localStorage
        const updatedUser = {
          ...user,
          isPremium: true,
          premiumSince: new Date().toISOString(),
        }
        localStorage.setItem('upgradeUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return
      }

      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          premium_since: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Reload user data
      await loadUserProfile(user.id)
    } catch (error) {
      console.error('Upgrade to premium error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    isTrialActive,
    getDaysLeftInTrial,
    upgradeToPremium,
    addToWatchlist,
    removeFromWatchlist,
    addToPortfolio,
    removeFromPortfolio,
    isInWatchlist,
    isInPortfolio,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
