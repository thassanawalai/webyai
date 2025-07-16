const express = require('express');
const db = require('../db');
const router = express.Router();

// Get user by email (schema ใหม่)
router.get('/', (req, res) => {
  const { email } = req.query;
  db.get('SELECT * FROM users WHERE user_email = ?', [email], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      user_role: user.user_role,
      user_profile_img: user.user_profile_img,
      user_created_at: user.user_created_at,
      phone: user.phone,
      email_verified_at: user.email_verified_at,
      default_address_id: user.default_address_id
    });
  });
});

// Update user info (schema ใหม่)
router.post('/update', (req, res) => {
  const { user_email, user_name, phone, user_profile_img, user_role, default_address_id } = req.body;
  db.run('UPDATE users SET user_name=?, phone=?, user_profile_img=?, user_role=?, default_address_id=? WHERE user_email=?', [user_name, phone, user_profile_img, user_role, default_address_id, user_email], function(err) {
    if (err) return res.status(400).json({ error: 'Update failed' });
    res.json({ success: true });
  });
});

// Check duplicate email or phone (schema ใหม่)
router.post('/check-duplicate', (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) return res.status(400).json({ duplicate: false, message: 'No data provided' });
  db.get('SELECT * FROM users WHERE user_email = ? OR phone = ?', [email, phone], (err, user) => {
    if (err) return res.status(500).json({ duplicate: false, message: 'Database error' });
    if (user) {
      let msg = 'ข้อมูลนี้ถูกใช้ไปแล้ว';
      if (user.user_email === email) msg = 'อีเมลนี้ถูกใช้ไปแล้ว';
      else if (user.phone === phone) msg = 'เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว';
      return res.json({ duplicate: true, message: msg });
    }
    res.json({ duplicate: false });
  });
});

module.exports = router;
