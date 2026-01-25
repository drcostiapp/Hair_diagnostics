import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dr. Costi House of Beauty | Luxury Dermatology & Wellness',
  description: 'Where Science Enhances Beauty. Board-certified dermatology expertise, AI-powered diagnostics, and luxury wellness treatments in Beirut.',
  keywords: ['dermatology', 'luxury skincare', 'wellness', 'aesthetics', 'Beirut', 'Dr. Costi'],
  openGraph: {
    title: 'Dr. Costi House of Beauty',
    description: 'Where Science Enhances Beauty',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
