import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LET Reviewer - TSOK',
  description: 'LET Reviewer for Filipino Teachers',
  keywords: 'LET, Licensure Examination for Teachers, Philippines, Review, Education, TSOK',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  themeColor: '#16a34a',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
      </head>
      <body>{children}</body>
    </html>
  )
}
