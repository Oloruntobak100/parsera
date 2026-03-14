import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Parsera Scraper',
  description: 'Extract structured data from any URL with Parsera',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakarta.variable} ${spaceGrotesk.variable} min-h-screen font-sans text-zinc-100 antialiased`}
      >
        <div className="bg-app-shell relative min-h-screen">
          <div className="bg-app-grid pointer-events-none fixed inset-0 z-0" aria-hidden />
          <div className="bg-app-glow pointer-events-none fixed inset-0 z-0" aria-hidden />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  )
}
