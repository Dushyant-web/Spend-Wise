import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/components/providers/QueryProvider'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'SpendWise AI — Your money, finally intelligent.',
    template: '%s | SpendWise AI',
  },
  description:
    'Track expenses, predict overspending, and build better habits — all with AI. Built for Indian college students.',
  keywords: ['expense tracker', 'budget', 'AI', 'India', 'UPI', 'students', 'finance'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'SpendWise AI',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Satoshi variable font — Fontshare CDN */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap"
        />
      </head>
      <body className="font-sans antialiased" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            {children}
          </QueryProvider>
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                fontSize: '0.813rem',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: '360px',
              },
              success: {
                iconTheme: { primary: '#10C98F', secondary: 'var(--bg-elevated)' },
                style: {
                  borderLeft: '3px solid #10C98F',
                },
              },
              error: {
                iconTheme: { primary: '#F05672', secondary: 'var(--bg-elevated)' },
                style: {
                  borderLeft: '3px solid #F05672',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
