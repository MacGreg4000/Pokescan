interface PriceBadgeProps {
  priceUSD: number | null
  priceEUR: number | null
}

export default function PriceBadge({ priceUSD, priceEUR }: PriceBadgeProps) {
  const tier =
    priceUSD === null
      ? 'none'
      : priceUSD > 10
        ? 'high'
        : priceUSD >= 2
          ? 'mid'
          : 'low'

  const tierStyles = {
    high: 'bg-green-500 text-white',
    mid: 'bg-poke-yellow text-black',
    low: 'bg-red-400 text-white',
    none: 'bg-white/20 text-white/60',
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tierStyles[tier]}`}
      >
        <span>$</span>
        <span>{priceUSD !== null ? priceUSD.toFixed(2) : 'Sans valeur'}</span>
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/80">
        <span>€</span>
        <span>{priceEUR !== null ? priceEUR.toFixed(2) : 'Sans valeur'}</span>
      </span>
    </div>
  )
}
