import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Red Herring Roulette',
  description: 'A fun word puzzle game',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
