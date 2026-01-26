import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ApolloProvider } from '@/components/providers/ApolloProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LegalDoji - E-Notary & Legal Document Platform',
  description: 'Create, notarize, and manage legal documents online with verified notaries across India',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ApolloProvider>
      </body>
    </html>
  )
}
