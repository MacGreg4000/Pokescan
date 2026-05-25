'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <span className="text-6xl">⚠️</span>
      <h2 className="text-xl font-bold text-white">Une erreur est survenue</h2>
      <p className="text-white/50 text-sm max-w-md">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-poke-red text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
      >
        Réessayer
      </button>
    </div>
  )
}
