'use client'

import { AuthProvider } from '@/lib/AuthContext'

export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}
