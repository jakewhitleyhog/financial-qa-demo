/**
 * Oil Price Service — fetches WTI spot price from EIA and caches in SQLite.
 *
 * Strategy: lazy fetch with 24h in-memory TTL.
 * - First request after startup triggers a fetch from EIA.
 * - Subsequent requests within 24h are served from SQLite cache.
 * - If EIA is unavailable, stale rows from SQLite are returned.
 * - If EIA_API_KEY is not set, the cache stays empty and callers receive null.
 */

import { getDatabase, saveDatabase, query } from '../config/database.js';

const EIA_BASE = 'https://api.eia.gov/v2/petroleum/pri/spt/data/';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Module-level sentinel — avoids rechecking SQLite timestamps on every request
let lastFetchedAt = null;
// Deduplicates concurrent refresh calls so only one EIA fetch runs at a time
let fetchPromise = null;

/**
 * Ensure the oil_price_cache table exists.
 * Safe to call on every startup — uses IF NOT EXISTS.
 */
function ensureTable() {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS oil_price_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period TEXT NOT NULL UNIQUE,
      price_usd DECIMAL(8, 2) NOT NULL,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_oil_price_cache_period ON oil_price_cache(period DESC);
  `);
  saveDatabase();
}

/**
 * Fetch up to 35 days of WTI spot price from EIA and upsert into SQLite.
 * Never throws — failures are logged and the caller falls back to cached data.
 */
async function fetchFromEIA() {
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.log('[oilPriceService] EIA_API_KEY not set — skipping fetch');
    return;
  }

  const url = new URL(EIA_BASE);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('frequency', 'daily');
  url.searchParams.append('data[0]', 'value');
  url.searchParams.append('facets[series][]', 'RWTC');
  url.searchParams.append('sort[0][column]', 'period');
  url.searchParams.append('sort[0][direction]', 'desc');
  url.searchParams.set('length', '35');

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`EIA HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const rows = json?.response?.data ?? [];

    if (rows.length === 0) {
      console.warn('[oilPriceService] EIA returned empty data');
      return;
    }

    // Use getDatabase().run() directly to avoid 35 individual saveDatabase() calls.
    // The exported run() wrapper calls saveDatabase() after every statement — too slow for a batch.
    const db = getDatabase();
    for (const row of rows) {
      if (!row.period || row.value == null) continue;
      db.run(
        `INSERT INTO oil_price_cache (period, price_usd, fetched_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(period) DO UPDATE SET
           price_usd  = excluded.price_usd,
           fetched_at = excluded.fetched_at`,
        [row.period, parseFloat(row.value)]
      );
    }
    saveDatabase(); // single flush for all 35 upserts

    lastFetchedAt = Date.now();
    console.log(`[oilPriceService] Refreshed ${rows.length} WTI price rows from EIA`);

  } catch (err) {
    console.error('[oilPriceService] EIA fetch failed:', err.message);
    // Intentionally swallowed — callers fall back to stale SQLite data
  }
}

/**
 * Trigger a refresh if the in-memory TTL has expired or we haven't fetched yet.
 * Concurrent callers share a single in-flight fetch — only one EIA request runs at a time.
 * Never throws.
 */
async function refreshIfStale() {
  const isStale = !lastFetchedAt || (Date.now() - lastFetchedAt) > CACHE_TTL_MS;
  if (!isStale) return;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetchFromEIA().finally(() => { fetchPromise = null; });
  return fetchPromise;
}

/**
 * Return the most recent WTI price row.
 * @returns {{ period: string, priceUsd: number } | null}
 */
function getLatestPrice() {
  const rows = query(
    `SELECT period, price_usd FROM oil_price_cache ORDER BY period DESC LIMIT 1`
  );
  if (!rows.length) return null;
  return { period: rows[0].period, priceUsd: rows[0].price_usd };
}

/**
 * Return the last N days of WTI prices, oldest first (for sparkline rendering).
 * @param {number} days
 * @returns {Array<{ period: string, priceUsd: number }>}
 */
function getPriceHistory(days = 30) {
  const rows = query(
    `SELECT period, price_usd FROM oil_price_cache ORDER BY period DESC LIMIT ?`,
    [days]
  );
  return rows
    .map(r => ({ period: r.period, priceUsd: r.price_usd }))
    .reverse(); // oldest → newest for chart rendering
}

/**
 * Public API — ensures table exists, refreshes if stale, returns data.
 * @returns {Promise<{ latest: object|null, history: Array }>}
 */
export async function getOilPriceData() {
  ensureTable();
  await refreshIfStale();

  return {
    latest: getLatestPrice(),
    history: getPriceHistory(30)
  };
}

export default { getOilPriceData };
