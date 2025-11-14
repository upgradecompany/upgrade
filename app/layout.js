import './globals.css'

export const metadata = {
  title: 'UpGrade - Trading Card Value Comparison',
  description: 'Compare raw trading card values with PSA 10 graded values',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
