'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/admin'

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push(from)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Erreur inconnue')
      }
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-poke-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16">
              <Image src="/pokeball.svg" alt="PokéScan" width={64} height={64} priority />
            </div>
          </div>
          <h1 className="text-3xl font-black">
            <span className="text-poke-yellow">Poké</span>
            <span className="text-white">Scan</span>
          </h1>
          <p className="text-white/40 text-sm">Accès administration</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-poke-navy/80 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm"
        >
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              className="w-full bg-poke-dark border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-poke-yellow/60 focus:ring-1 focus:ring-poke-yellow/30 transition"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-poke-red text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion…</>
            ) : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
