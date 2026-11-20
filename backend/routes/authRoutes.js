const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const pool = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
});

function publicUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    studentNumber: row.student_number,
    program: row.program,
    yearLevel: row.year_level,
    profilePhotoUrl: row.profile_photo_url,
  };
}

function issueSession(res, user) {
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.cookie('cms_session', token, cookieOptions());
}

router.post('/register', authLimit, async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }
    if (password.length < 10) {
      return res.status(400).json({ message: 'Password must contain at least 10 characters.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users(full_name, email, password_hash) VALUES($1, $2, $3) RETURNING *',
      [fullName.trim(), email.trim().toLowerCase(), hash]
    );
    await pool.query('INSERT INTO user_settings(user_id) VALUES($1)', [result.rows[0].id]);
    issueSession(res, result.rows[0]);
    res.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    next(e);
  }
});

router.post('/login', authLimit, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email.trim().toLowerCase(),
    ]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    issueSession(res, user);
    res.json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('cms_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.json({ message: 'Signed out successfully.' });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, student_number, program, year_level, profile_photo_url FROM users WHERE id = $1',
      [req.user.sub]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user: publicUser(result.rows[0]) });
  } catch (e) {
    next(e);
  }
});

router.post('/forgot-password', authLimit, async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const found = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    // Always return the same message to avoid account enumeration
    const generic = {
      message: 'If an account exists for that email, a reset link has been sent.',
    };

    if (!found.rowCount) return res.json(generic);

    if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) {
      return res.status(503).json({
        message:
          'Password reset email is not configured yet. The administrator must configure RESEND_API_KEY and MAIL_FROM.',
      });
    }

    const raw = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    await pool.query(
      `INSERT INTO password_reset_tokens(user_id, token_hash, expires_at)
       VALUES($1, $2, NOW() + INTERVAL '30 minutes')`,
      [found.rows[0].id, hash]
    );

    const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${appUrl.replace(/\/$/, '')}/reset-password?token=${raw}`;

    // Minimal Resend call without extra dependency
    const mailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [email],
        subject: 'College CMS password reset',
        html: `<p>You requested a password reset.</p><p><a href="${link}">Reset your password</a></p><p>This link expires in 30 minutes.</p>`,
      }),
    });

    if (!mailRes.ok) {
      console.error('Resend error', await mailRes.text());
      return res.status(502).json({ message: 'Failed to send reset email. Try again later.' });
    }

    res.json(generic);
  } catch (e) {
    next(e);
  }
});

router.post('/reset-password', authLimit, async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 10) {
      return res.status(400).json({
        message: 'A valid token and a new password of at least 10 characters are required.',
      });
    }
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const found = await pool.query(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [hash]
    );
    if (!found.rowCount) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    const row = found.rows[0];
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      passwordHash,
      row.user_id,
    ]);
    await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [row.id]);
    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
