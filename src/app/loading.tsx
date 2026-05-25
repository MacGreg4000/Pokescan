export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12"
          style={{ animation: 'pokeball-spin 1s linear infinite' }}
        >
          <img src="/pokeball.svg" alt="Chargement…" className="w-full h-full" />
        </div>
        <p className="text-white/40 text-sm">Chargement…</p>
      </div>
    </div>
  )
}
