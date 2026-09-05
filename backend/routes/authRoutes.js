const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { signToken, requireAuth, requireRole } = require('../middleware/auth');

const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000; // 8h, matches JWT expiry default

function setCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: COOKIE_MAX_AGE
  });
}

function publicUser(u) {
  return { id: u._id.toString(), username: u.username, role: u.role, name: u.name };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username: String(username).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await User.comparePassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    setCookie(res, token);
    return res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true' });
  return res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    return res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load session' });
  }
});

// ---- Admin-only user management ----
// POST /api/auth/register
router.post('/register', requireAuth, requireRole('admin'), async (req, res) => {
  const { username, password, role, name } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (role && !['admin', 'operator'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const existing = await User.findOne({ username: String(username).toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      username: String(username).toLowerCase().trim(),
      passwordHash,
      role: role || 'operator',
      name: name || ''
    });

    return res.status(201).json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// GET /api/auth/users
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: 1 });
    return res.json({
      success: true,
      users: users.map((u) => ({ id: u._id.toString(), username: u.username, role: u.role, name: u.name, createdAt: u.createdAt }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list users' });
  }
});

// DELETE /api/auth/users/:id
router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
