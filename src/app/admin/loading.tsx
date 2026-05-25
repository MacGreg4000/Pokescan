export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white/10 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-white/10 rounded-xl" />
    </div>
  )
}
