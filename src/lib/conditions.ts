export const CONDITIONS = ['NM', 'LP', 'MP', 'HP', 'DMG'] as const
export type Condition = (typeof CONDITIONS)[number]

export const CONDITION_LABELS: Record<
  Condition,
  { short: string; en: string; fr: string; badgeColor: string }
> = {
  NM:  { short: 'NM',  en: 'Near Mint',          fr: 'Quasi Neuf',          badgeColor: 'bg-green-500/20 text-green-400' },
  LP:  { short: 'LP',  en: 'Lightly Played',      fr: 'Légèrement Joué',     badgeColor: 'bg-lime-500/20 text-lime-400' },
  MP:  { short: 'MP',  en: 'Moderately Played',   fr: 'Moyennement Joué',    badgeColor: 'bg-yellow-500/20 text-yellow-400' },
  HP:  { short: 'HP',  en: 'Heavily Played',      fr: 'Très Joué',           badgeColor: 'bg-orange-500/20 text-orange-400' },
  DMG: { short: 'DMG', en: 'Damaged',             fr: 'Endommagé',           badgeColor: 'bg-red-500/20 text-red-400' },
}
