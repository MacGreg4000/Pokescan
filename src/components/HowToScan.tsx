'use client'

import { useState } from 'react'

const FR_EN: [string, string][] = [
  ['Dracaufeu', 'Charizard'],
  ['Méga-Dracaufeu', 'M Charizard-EX'],
  ['Salamèche', 'Charmander'],
  ['Reptincel', 'Charmeleon'],
  ['Bulbizarre', 'Bulbasaur'],
  ['Herbizarre', 'Ivysaur'],
  ['Florizarre', 'Venusaur'],
  ['Carapuce', 'Squirtle'],
  ['Carabaffe', 'Wartortle'],
  ['Tortank', 'Blastoise'],
  ['Ronflex', 'Snorlax'],
  ['Évoli', 'Eevee'],
  ['Mentali', 'Espeon'],
  ['Noctali', 'Umbreon'],
  ['Aquali', 'Vaporeon'],
  ['Pyroli', 'Flareon'],
  ['Voltali', 'Jolteon'],
  ['Givrali', 'Glaceon'],
  ['Phyllali', 'Leafeon'],
  ['Nymphali', 'Sylveon'],
  ['Lucario', 'Lucario'],
  ['Méga-Lucario', 'M Lucario-EX'],
  ['Gardevoir', 'Gardevoir'],
  ['Amphinobi', 'Greninja'],
  ['Rayquaza', 'Rayquaza'],
  ['Méga-Rayquaza', 'M Rayquaza-EX'],
  ['Mewtwo', 'Mewtwo'],
  ['Mew', 'Mew'],
  ['Lugia', 'Lugia'],
  ['Dialga', 'Dialga'],
  ['Palkia', 'Palkia'],
  ['Arceus', 'Arceus'],
  ['Zygarde', 'Zygarde'],
  ['Reshiram', 'Reshiram'],
  ['Zekrom', 'Zekrom'],
  ['Kyurem', 'Kyurem'],
  ['Darkrai', 'Darkrai'],
  ['Giratina', 'Giratina'],
  ['Zacian', 'Zacian'],
  ['Zamazenta', 'Zamazenta'],
  ['Zarude', 'Zarude'],
  ['Calyrex', 'Calyrex'],
  ['Miraidon', 'Miraidon'],
  ['Koraidon', 'Koraidon'],
  ['Tyranocif', 'Tyranitar'],
  ['Mackogneur', 'Machamp'],
  ['Dracolosse', 'Dragonite'],
  ['Nidoking', 'Nidoking'],
]

const SET_CODES: [string, string, string][] = [
  ['SVI / sv1', 'Écarlate et Violet', 'Scarlet & Violet'],
  ['PAL / sv2', 'Évolutions à Paldea', 'Paldea Evolved'],
  ['OBF / sv3', 'Flammes Obsidiennes', 'Obsidian Flames'],
  ['PAF', 'Destinées de Paldea', 'Paldean Fates'],
  ['TEF / sv5', 'Forces Temporelles', 'Temporal Forces'],
  ['TWM / sv6', 'Mascarade Crépusculaire', 'Twilight Masquerade'],
  ['SCR / sv7', 'Couronne Stellaire', 'Stellar Crown'],
  ['SSP / sv8', 'Étincelles Surpuissantes', 'Surging Sparks'],
  ['PRE / sv9', 'Prismatic Evolutions', 'Prismatic Evolutions'],
  ['SVP', 'Promos Écarlate et Violet', 'Scarlet & Violet Promos'],
  ['SWH / swsh1', 'Épée et Bouclier', 'Sword & Shield'],
  ['SWSH-P', 'Promos Épée et Bouclier', 'SWSH Black Star Promos'],
  ['XY1', 'Série XY', 'XY Base'],
  ['XYFL / xy2', 'Poings Furieux (XY)', 'XY Flashfire'],
]

export default function HowToScan() {
  const [open, setOpen] = useState(false)
  const [tableOpen, setTableOpen] = useState(false)

  return (
    <div className="bg-poke-navy/40 border border-white/10 rounded-2xl overflow-hidden">
      {/* En-tête cliquable */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition"
      >
        <span className="flex items-center gap-2 font-semibold text-white text-sm">
          <span className="text-poke-yellow text-base">📖</span>
          Guide : comment encoder une carte manuellement
        </span>
        <span className={`text-white/30 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="border-t border-white/10 px-5 pb-6 space-y-6">

          {/* ── 1. Anatomie d'une carte ── */}
          <div className="pt-5 space-y-3">
            <h3 className="text-sm font-bold text-poke-yellow flex items-center gap-1.5">
              <span>1</span>
              <span className="w-px h-3 bg-poke-yellow/40" />
              Où lire les infos sur ta carte ?
            </h3>
            <div className="bg-black/30 rounded-xl p-4 font-mono text-xs leading-relaxed">
              <div className="text-white/80 mb-2">┌─────────────────────────────┐</div>
              <div className="text-white/80">│  <span className="text-poke-yellow font-bold">NOM DE LA CARTE</span>        PV 330  │</div>
              <div className="text-white/50">│  ·  ·  ·  ·  ·  ·  ·  ·  ·  │</div>
              <div className="text-white/50">│       [Image de la carte]   │</div>
              <div className="text-white/50">│  ·  ·  ·  ·  ·  ·  ·  ·  ·  │</div>
              <div className="text-white/80">│  <span className="text-green-400">056/102</span>   ◆   <span className="text-white/40">© Nintendo</span>       │</div>
              <div className="text-white/80">└─────────────────────────────┘</div>
              <div className="mt-3 space-y-1.5 text-white/60 font-sans text-xs">
                <div><span className="text-poke-yellow">Nom</span> — en haut : c&apos;est le nom <span className="text-red-400">français</span>, on a besoin du nom <span className="text-green-400">anglais</span></div>
                <div><span className="text-green-400">056/102</span> — en bas à gauche : numéro de carte / total du set</div>
                <div><span className="text-white/40">PV 330</span> — points de vie (HP en anglais)</div>
              </div>
            </div>
          </div>

          {/* ── 2. Formats de numéros ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-poke-yellow flex items-center gap-1.5">
              <span>2</span>
              <span className="w-px h-3 bg-poke-yellow/40" />
              Les deux formats de numéros
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Format standard */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-xs font-bold px-2 py-0.5 bg-green-400/10 rounded-full">STANDARD</span>
                  <span className="text-white/50 text-xs">La plupart des cartes</span>
                </div>
                <div className="font-mono text-lg text-white text-center py-2 bg-black/20 rounded-lg">
                  <span className="text-green-400">056</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white/60">102</span>
                </div>
                <div className="text-xs text-white/60 space-y-1">
                  <div><span className="text-green-400">056</span> = N° de la carte dans le set</div>
                  <div><span className="text-white/40">102</span> = Total de cartes du set</div>
                  <div className="text-poke-yellow pt-1">→ Tapez <strong>56</strong> ou <strong>56/102</strong> dans le champ N° carte</div>
                </div>
              </div>

              {/* Format promo */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-xs font-bold px-2 py-0.5 bg-blue-400/10 rounded-full">PROMO</span>
                  <span className="text-white/50 text-xs">Cartes spéciales</span>
                </div>
                <div className="font-mono text-lg text-white text-center py-2 bg-black/20 rounded-lg">
                  <span className="text-white/40">SVPFR</span>
                  <span className="text-blue-400">056</span>
                </div>
                <div className="text-xs text-white/60 space-y-1">
                  <div><span className="text-white/40">SVPFR</span> = code du set promo français</div>
                  <div><span className="text-blue-400">056</span> = N° de la carte promo</div>
                  <div className="text-poke-yellow pt-1">→ Tapez <strong>56</strong> ou <strong>056</strong> dans le champ N° carte</div>
                </div>
              </div>
            </div>

            <div className="bg-poke-yellow/5 border border-poke-yellow/20 rounded-xl p-3 text-xs text-white/70">
              <span className="text-poke-yellow font-bold">Astuce :</span> Le numéro de carte est universel — il fonctionne quelle que soit la langue de la carte. C&apos;est la méthode la plus fiable.
            </div>
          </div>

          {/* ── 3. Codes de sets ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-poke-yellow flex items-center gap-1.5">
              <span>3</span>
              <span className="w-px h-3 bg-poke-yellow/40" />
              Codes des sets principaux
            </h3>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-3 py-2 text-left text-white/40 font-medium">Code API</th>
                    <th className="px-3 py-2 text-left text-white/40 font-medium">Nom FR</th>
                    <th className="px-3 py-2 text-left text-white/40 font-medium hidden sm:table-cell">Nom EN</th>
                  </tr>
                </thead>
                <tbody>
                  {SET_CODES.map(([code, fr, en], i) => (
                    <tr key={code} className={i % 2 === 0 ? 'bg-white/2' : ''}>
                      <td className="px-3 py-1.5 font-mono text-poke-yellow">{code}</td>
                      <td className="px-3 py-1.5 text-white/70">{fr}</td>
                      <td className="px-3 py-1.5 text-white/40 hidden sm:table-cell">{en}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 4. Noms FR→EN ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-poke-yellow flex items-center gap-1.5">
              <span>4</span>
              <span className="w-px h-3 bg-poke-yellow/40" />
              Noms français → anglais
            </h3>
            <p className="text-xs text-white/50">
              La base pokemontcg.io utilise les noms <strong className="text-white/70">anglais</strong>. Si tu saisis un nom, utilise la colonne de droite.
            </p>
            <button
              onClick={() => setTableOpen(o => !o)}
              className="w-full text-xs text-poke-yellow/70 hover:text-poke-yellow border border-poke-yellow/20 hover:border-poke-yellow/40 rounded-lg py-2 transition"
            >
              {tableOpen ? '▲ Masquer' : '▼ Voir'} le tableau de traduction ({FR_EN.length} Pokémon)
            </button>

            {tableOpen && (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="grid grid-cols-2 divide-x divide-white/10">
                  <div className="bg-red-500/5 px-3 py-2 text-xs text-red-400 font-bold">Français</div>
                  <div className="bg-green-500/5 px-3 py-2 text-xs text-green-400 font-bold">Anglais (à taper)</div>
                </div>
                <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                  {FR_EN.map(([fr, en], i) => (
                    <div key={fr} className={`grid grid-cols-2 divide-x divide-white/5 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                      <div className="px-3 py-1.5 text-xs text-white/60">{fr}</div>
                      <div className="px-3 py-1.5 text-xs font-medium text-white/90">{en}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 5. Mode manuel — étapes ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-poke-yellow flex items-center gap-1.5">
              <span>5</span>
              <span className="w-px h-3 bg-poke-yellow/40" />
              Utiliser le mode Manuel — étapes
            </h3>
            <ol className="space-y-2">
              {[
                { n: '1', text: 'Onglet ⌨️ Manuel dans le scanner ci-dessus' },
                { n: '2', text: 'Champ "N° de carte" : tape le numéro du bas de ta carte (ex: 56 ou 56/102 ou SVP056)' },
                { n: '3', text: 'Champ "Nom" (optionnel) : nom anglais si tu le connais (ex: Charizard EX). Inutile si tu as le numéro.' },
                { n: '4', text: '"Extension" : laisse sur "Toutes" sauf si tu as le même numéro dans plusieurs sets' },
                { n: '5', text: '"État" : NM = Quasi Neuf, LP = Légèrement Joué, MP = Modérément Joué, etc.' },
                { n: '6', text: 'Clique sur "Scanner & Valoriser" → la carte et son prix s\'affichent' },
              ].map(({ n, text }) => (
                <li key={n} className="flex gap-3 items-start text-xs text-white/60">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-poke-yellow/20 text-poke-yellow font-bold text-xs flex items-center justify-center mt-0.5">{n}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── 6. Exemples concrets ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-poke-yellow flex items-center gap-1.5">
              <span>6</span>
              <span className="w-px h-3 bg-poke-yellow/40" />
              Exemples concrets
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: 'Dracaufeu-ex Promo SV (SVPFR056)',
                  num: '56',
                  name: '',
                  tip: 'Juste le numéro suffit — la traduction se fait automatiquement',
                  color: 'orange',
                },
                {
                  label: 'Kingdra EX (Flammes Obsidiennes, 38/197)',
                  num: '38/197',
                  name: 'Kingdra EX',
                  tip: 'Numéro + nom anglais = résultat précis',
                  color: 'blue',
                },
                {
                  label: 'Pikachu (Écarlate et Violet, 79/198)',
                  num: '79',
                  name: '',
                  tip: 'Le numéro seul trouvera le Pikachu de ce set parmi tous les Pikachu existants',
                  color: 'yellow',
                },
              ].map(ex => (
                <div key={ex.label} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5">
                  <div className="text-xs font-medium text-white">{ex.label}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-green-500/10 border border-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                      N° : <strong>{ex.num}</strong>
                    </span>
                    {ex.name && (
                      <span className="bg-poke-yellow/10 border border-poke-yellow/20 text-poke-yellow px-2 py-0.5 rounded-full">
                        Nom : <strong>{ex.name}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 italic">{ex.tip}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
