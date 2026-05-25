'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname.startsWith('/admin')

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-poke-red border-b border-red-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href={isAdmin ? '/admin' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 transition-transform duration-300 group-hover:rotate-180">
              <Image src="/pokeball.svg" alt="PokéScan" width={32} height={32} priority />
            </div>
            <span className="font-black text-poke-yellow text-lg tracking-wide drop-shadow-sm">
              Poké<span className="text-white">Scan</span>
              {isAdmin && (
                <span className="ml-2 text-xs font-semibold text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {isAdmin ? (
              <>
                <Link
                  href="/"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition flex items-center gap-1"
                >
                  Vitrine ↗
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  Collection
                </Link>
                <Link
                  href="/admin/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition text-xs"
                >
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
