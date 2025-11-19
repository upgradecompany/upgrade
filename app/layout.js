import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'UpGrade - Trading Card Value Comparison',
  description: 'Compare raw trading card values with PSA 10 graded values',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
