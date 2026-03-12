const db = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Get advocate profile
 * GET /api/settings/profile
 */
exports.getProfile = (req, res) => {
  const sql = 'SELECT id, name, email, phone, created_at FROM advocates WHERE id = ?';
  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(result[0]);
  });
};

/**
 * Update advocate profile
 * PUT /api/settings/profile
 */
exports.updateProfile = (req, res) => {
  const { name, phone } = req.body;
  const sql = 'UPDATE advocates SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?';
  db.query(sql, [name || null, phone || null, req.advocateId], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
    res.json({ message: 'Profile updated successfully' });
  });
};

/**
 * Change password
 * PUT /api/settings/change-password
 */
exports.changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const sql = 'SELECT password FROM advocates WHERE id = ?';
  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error verifying password', error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    bcrypt.compare(currentPassword, result[0].password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error verifying password' });
      }
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ message: 'Error hashing password' });
        }
        db.query('UPDATE advocates SET password = ? WHERE id = ?', [hash, req.advocateId], (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error updating password', error: err.message });
          }
          res.json({ message: 'Password changed successfully' });
        });
      });
    });
  });
};
