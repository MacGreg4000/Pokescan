import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'PokéScan — Valorisateur de cartes Pokémon TCG',
  description: 'Scannez et valorisez vos cartes Pokémon avec des prix réels via pokemontcg.io',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
