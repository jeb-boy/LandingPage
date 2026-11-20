const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/profile', async (req, res, next) => {
  try {
    const r = await pool.query(
      `SELECT id, full_name, email, role, student_number, program, year_level, profile_photo_url
       FROM users WHERE id = $1`,
      [req.user.sub]
    );
    if (!r.rowCount) return res.status(404).json({ message: 'User not found.' });
    const u = r.rows[0];
    res.json({
      profile: {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        studentNumber: u.student_number,
        program: u.program,
        yearLevel: u.year_level,
        profilePhotoUrl: u.profile_photo_url,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/profile', async (req, res, next) => {
  try {
    const { fullName, program, yearLevel } = req.body;
    if (!fullName?.trim()) {
      return res.status(400).json({ message: 'Full name is required.' });
    }
    const r = await pool.query(
      `UPDATE users
       SET full_name = $1, program = $2, year_level = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, full_name, email, role, student_number, program, year_level, profile_photo_url`,
      [fullName.trim(), program || null, yearLevel || null, req.user.sub]
    );
    const u = r.rows[0];
    res.json({
      profile: {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        studentNumber: u.student_number,
        program: u.program,
        yearLevel: u.year_level,
        profilePhotoUrl: u.profile_photo_url,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 10) {
      return res.status(400).json({
        message: 'Current password and a new password of at least 10 characters are required.',
      });
    }
    const r = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.sub]);
    if (!r.rowCount || !(await bcrypt.compare(currentPassword, r.rows[0].password_hash))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hash, req.user.sub]
    );
    res.json({ message: 'Password changed successfully.' });
  } catch (e) {
    next(e);
  }
});

router.get('/settings', async (req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.sub]);
    if (!r.rowCount) {
      await pool.query('INSERT INTO user_settings(user_id) VALUES($1)', [req.user.sub]);
      return res.json({
        settings: { email_updates: true, notifications: true, theme: 'light' },
      });
    }
    const s = r.rows[0];
    res.json({
      settings: {
        email_updates: s.email_updates,
        notifications: s.notifications,
        theme: s.theme,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    const emailUpdates = req.body.emailUpdates ?? req.body.email_updates;
    const notifications = req.body.notifications;
    const theme = req.body.theme || 'light';
    if (!['light', 'dark', 'system'].includes(theme)) {
      return res.status(400).json({ message: 'Theme must be light, dark, or system.' });
    }
    const r = await pool.query(
      `INSERT INTO user_settings(user_id, email_updates, notifications, theme, updated_at)
       VALUES($1, COALESCE($2, TRUE), COALESCE($3, TRUE), $4, NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET email_updates = COALESCE($2, user_settings.email_updates),
           notifications = COALESCE($3, user_settings.notifications),
           theme = $4,
           updated_at = NOW()
       RETURNING *`,
      [req.user.sub, emailUpdates, notifications, theme]
    );
    const s = r.rows[0];
    res.json({
      settings: {
        email_updates: s.email_updates,
        notifications: s.notifications,
        theme: s.theme,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
