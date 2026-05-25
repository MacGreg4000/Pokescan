import Database from 'better-sqlite3'
import path from 'path'
import type { CardScanned, SetCache, AdminStats, CardCondition } from '@/types/card'

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'pokescan.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  bootstrap(_db)
  return _db
}

function bootstrap(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards_scanned (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      set_id      TEXT    NOT NULL,
      condition   TEXT    NOT NULL,
      price_usd   REAL,
      price_eur   REAL,
      scanned_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      image_url   TEXT
    );

    CREATE TABLE IF NOT EXISTS sets_cache (
      id          TEXT    PRIMARY KEY,
      name        TEXT    NOT NULL,
      series      TEXT    NOT NULL,
      total       INTEGER NOT NULL,
      cached_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  // Migrations — colonnes ajoutées après la v1 (sans IF NOT EXISTS : on catch l'erreur)
  const migrations = [
    'ALTER TABLE cards_scanned ADD COLUMN source TEXT',
    'ALTER TABLE cards_scanned ADD COLUMN confidence TEXT',
    'ALTER TABLE cards_scanned ADD COLUMN notes TEXT',
    'ALTER TABLE cards_scanned ADD COLUMN for_sale INTEGER NOT NULL DEFAULT 1',
  ]
  for (const sql of migrations) {
    try { db.exec(sql) } catch { /* colonne déjà existante */ }
  }
}

export function insertScannedCard(params: {
  name: string
  set_id: string
  condition: CardCondition
  price_usd: number | null
  price_eur: number | null
  image_url: string | null
  source?: string | null
  confidence?: string | null
  notes?: string | null
}): CardScanned {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO cards_scanned (name, set_id, condition, price_usd, price_eur, image_url, source, confidence, notes)
    VALUES (@name, @set_id, @condition, @price_usd, @price_eur, @image_url, @source, @confidence, @notes)
  `)
  const result = stmt.run({
    ...params,
    source: params.source ?? null,
    confidence: params.confidence ?? null,
    notes: params.notes ?? null,
  })
  return getScannedCardById(result.lastInsertRowid as number)!
}

export function getScannedCardById(id: number): CardScanned | null {
  const db = getDb()
  return db.prepare('SELECT * FROM cards_scanned WHERE id = ?').get(id) as CardScanned | null
}

export function getScannedCards(params: {
  search?: string
  page?: number
  limit?: number
  forSale?: boolean
}): { cards: CardScanned[]; total: number } {
  const db = getDb()
  const { search = '', page = 1, limit = 20, forSale } = params
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const args: unknown[] = []

  if (search) {
    conditions.push(`name LIKE '%' || ? || '%'`)
    args.push(search)
  }
  if (forSale === true) {
    conditions.push('for_sale = 1')
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const cards = db
    .prepare(`SELECT * FROM cards_scanned ${where} ORDER BY scanned_at DESC LIMIT ? OFFSET ?`)
    .all(...args, limit, offset) as CardScanned[]

  const { total } = db
    .prepare(`SELECT COUNT(*) as total FROM cards_scanned ${where}`)
    .get(...args) as { total: number }

  return { cards, total }
}

export function upsertSetCache(sets: SetCache[]): void {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO sets_cache (id, name, series, total, cached_at)
    VALUES (@id, @name, @series, @total, @cached_at)
  `)
  const upsertMany = db.transaction((rows: SetCache[]) => {
    for (const row of rows) stmt.run(row)
  })
  upsertMany(sets)
}

export function getSetsCache(): SetCache[] {
  const db = getDb()
  return db.prepare('SELECT * FROM sets_cache ORDER BY name ASC').all() as SetCache[]
}

export function getSetsCacheAge(): string | null {
  const db = getDb()
  const row = db
    .prepare('SELECT MIN(cached_at) as oldest FROM sets_cache')
    .get() as { oldest: string | null }
  return row.oldest
}

export function deleteCard(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM cards_scanned WHERE id = ?').run(id)
}

export function updateCard(
  id: number,
  params: {
    condition?: string
    notes?: string | null
    for_sale?: 0 | 1
  }
): CardScanned | null {
  const db = getDb()
  const updates: string[] = []
  const values: Record<string, unknown> = { id }

  if (params.condition !== undefined) {
    updates.push('condition = @condition')
    values.condition = params.condition
  }
  if (params.notes !== undefined) {
    updates.push('notes = @notes')
    values.notes = params.notes
  }
  if (params.for_sale !== undefined) {
    updates.push('for_sale = @for_sale')
    values.for_sale = params.for_sale
  }

  if (updates.length === 0) return getScannedCardById(id)
  db.prepare(`UPDATE cards_scanned SET ${updates.join(', ')} WHERE id = @id`).run(values)
  return getScannedCardById(id)
}

export function getAdminStats(): AdminStats {
  const db = getDb()
  return db
    .prepare(`
      SELECT
        COUNT(*)               AS total_scanned,
        AVG(price_usd)         AS avg_price_usd,
        AVG(price_eur)         AS avg_price_eur,
        MAX(scanned_at)        AS last_scan,
        COUNT(DISTINCT set_id) AS sets_count
      FROM cards_scanned
    `)
    .get() as AdminStats
}
