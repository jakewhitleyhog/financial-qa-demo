import { getOilPriceData } from '../services/oilPriceService.js';

/**
 * GET /api/deals/oil-price
 * Returns the latest WTI price and 30-day history.
 * Always responds HTTP 200 — callers treat null latest as "data unavailable".
 */
export async function getOilPrice(req, res) {
  try {
    const data = await getOilPriceData();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[oilPriceController] Unexpected error:', err.message);
    res.json({ success: true, data: { latest: null, history: [] } });
  }
}

export default { getOilPrice };
