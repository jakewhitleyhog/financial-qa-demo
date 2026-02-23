import { query, run } from '../config/database.js';
import { generateToken, generateMagicToken, MAGIC_LINK_EXPIRY_MINUTES } from '../config/auth.js';
import { sendMagicLink } from '../services/emailService.js';

const DEAL_NAME = process.env.DEAL_NAME || 'Investor Portal';

export async function requestMagicLink(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Always return the same message to prevent email enumeration
    const genericMessage = 'If this email is authorized, you will receive a login link shortly.';

    const investors = query(
      'SELECT id, email, name FROM authorized_investors WHERE LOWER(email) = ?',
      [normalizedEmail]
    );

    if (investors.length === 0) {
      return res.json({ success: true, message: genericMessage });
    }

    const investor = investors[0];

    // Generate magic token
    const token = generateMagicToken();
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Store token
    run(
      'INSERT INTO auth_tokens (investor_id, token, expires_at) VALUES (?, ?, ?)',
      [investor.id, token, expiresAt]
    );

    // Send email (or log to console in dev)
    await sendMagicLink(investor.email, token, DEAL_NAME);

    res.json({ success: true, message: genericMessage });
  } catch (error) {
    console.error('Error requesting magic link:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
}

export async function verifyMagicLink(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    // Look up token
    const tokens = query(
      'SELECT id, investor_id, expires_at, used FROM auth_tokens WHERE token = ?',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired link. Please request a new one.',
      });
    }

    const authToken = tokens[0];

    if (authToken.used) {
      return res.status(401).json({
        success: false,
        error: 'This link has already been used. Please request a new one.',
      });
    }

    if (new Date(authToken.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'This link has expired. Please request a new one.',
      });
    }

    // Mark token as used
    run('UPDATE auth_tokens SET used = 1 WHERE id = ?', [authToken.id]);

    // Get investor
    const investors = query(
      'SELECT id, email, name, role, deal_id FROM authorized_investors WHERE id = ?',
      [authToken.investor_id]
    );

    if (investors.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Investor not found',
      });
    }

    const investor = investors[0];

    // Generate JWT
    const jwt = generateToken({
      investorId: investor.id,
      email: investor.email,
      name: investor.name,
      role: investor.role,
      dealId: investor.deal_id,
    });

    // Set httpOnly cookie
    res.cookie('token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      investor: {
        id: investor.id,
        email: investor.email,
        name: investor.name,
        role: investor.role,
      },
    });
  } catch (error) {
    console.error('Error verifying magic link:', error);
    res.status(500).json({ success: false, error: 'Failed to verify link' });
  }
}

export function getMe(req, res) {
  res.json({
    success: true,
    investor: {
      id: req.investor.id,
      email: req.investor.email,
      name: req.investor.name,
      role: req.investor.role,
    },
  });
}

export function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ success: true, message: 'Logged out' });
}

/**
 * Demo login — creates a session as the first authorized investor (bypasses email flow)
 * POST /api/auth/demo
 */
export function demoLogin(req, res) {
  try {
    // Get the first authorized investor
    const investors = query('SELECT id, email, name, role, deal_id FROM authorized_investors LIMIT 1');

    if (investors.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No demo investor configured',
      });
    }

    const investor = investors[0];

    const jwt = generateToken({
      investorId: investor.id,
      email: investor.email,
      name: investor.name,
      role: investor.role,
      dealId: investor.deal_id,
    });

    res.cookie('token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      investor: {
        id: investor.id,
        email: investor.email,
        name: investor.name,
        role: investor.role,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ success: false, error: 'Demo login failed' });
  }
}
