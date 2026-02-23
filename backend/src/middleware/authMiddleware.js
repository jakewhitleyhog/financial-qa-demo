import { verifyToken } from '../config/auth.js';
import { query } from '../config/database.js';

export function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  try {
    const payload = verifyToken(token);

    const investors = query(
      'SELECT id, email, name, role, deal_id FROM authorized_investors WHERE id = ?',
      [payload.investorId]
    );

    if (investors.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Investor not found',
      });
    }

    req.investor = investors[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

/**
 * Requires the authenticated user to have the 'admin' role (GP/moderator).
 * Must be used after requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (req.investor?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }
  next();
}
