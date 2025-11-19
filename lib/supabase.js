/**
 * Supabase Client Configuration
 *
 * This file initializes the Supabase client for database and auth operations.
 */

import { createClient } from '@supabase/supabase-js'

// Get credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that credentials are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not found. Using localStorage fallback.')
}

// Create and export the Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null
}
