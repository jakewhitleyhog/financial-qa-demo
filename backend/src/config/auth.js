import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('WARNING: Using default JWT_SECRET. Set JWT_SECRET env var for production.');
  return 'dev-secret-change-me-in-production';
})();

const JWT_EXPIRY = '7d';
const MAGIC_LINK_EXPIRY_MINUTES = 15;

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function generateMagicToken() {
  return crypto.randomBytes(32).toString('hex');
}

export { JWT_SECRET, JWT_EXPIRY, MAGIC_LINK_EXPIRY_MINUTES };
