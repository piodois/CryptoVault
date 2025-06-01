// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cryptovault.app'),
  title: {
    default: 'CryptoVault - Gestión Profesional de Portafolios Crypto',
    template: '%s | CryptoVault'
  },
  description: 'Plataforma profesional para gestión de portafolios de criptomonedas con datos en tiempo real y análisis avanzado.',
  keywords: [
    'criptomonedas',
    'bitcoin',
    'ethereum',
    'portfolio',
    'trading',
    'fintech',
    'blockchain'
  ],
  authors: [{ name: 'CryptoVault Team' }],
  creator: 'CryptoVault',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://cryptovault.app',
    title: 'CryptoVault - Gestión Profesional de Portafolios Crypto',
    description: 'Plataforma profesional para gestión de portafolios de criptomonedas',
   siteName: 'CryptoVault',
   images: [
     {
       url: '/og-image.png',
       width: 1200,
       height: 630,
       alt: 'CryptoVault'
     }
   ]
 },
 twitter: {
   card: 'summary_large_image',
   title: 'CryptoVault - Gestión Profesional de Portafolios Crypto',
   description: 'Plataforma profesional para gestión de portafolios de criptomonedas',
   images: ['/og-image.png']
 },
 robots: {
   index: true,
   follow: true,
   googleBot: {
     index: true,
     follow: true,
     'max-video-preview': -1,
     'max-image-preview': 'large',
     'max-snippet': -1
   }
 }
}

export default function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
   <html lang="es" className="scroll-smooth">
     <body className={`${inter.className} antialiased`}>
       <Providers>
         {children}
       </Providers>
     </body>
   </html>
 )
}