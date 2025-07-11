const express = require('express');
const db = require('../db');
const router = express.Router();

// Get user by email
router.get('/', (req, res) => {
  const { email } = req.query;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user.id,
      fullName: user.full_name,
      phone: user.phone,
      address: user.address,
      province: user.province,
      district: user.district,
      postalCode: user.postal_code,
      email: user.email
    });
  });
});

// Update user info
router.post('/update', (req, res) => {
  const { email, fullName, phone, address } = req.body;
  db.run('UPDATE users SET full_name=?, phone=?, address=? WHERE email=?', [fullName, phone, address, email], function(err) {
    if (err) return res.status(400).json({ error: 'Update failed' });
    res.json({ success: true });
  });
});

// Check duplicate email or phone
router.post('/check-duplicate', (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) return res.status(400).json({ duplicate: false, message: 'No data provided' });
  db.get('SELECT * FROM users WHERE email = ? OR phone = ?', [email, phone], (err, user) => {
    if (err) return res.status(500).json({ duplicate: false, message: 'Database error' });
    if (user) {
      let msg = 'ข้อมูลนี้ถูกใช้ไปแล้ว';
      if (user.email === email) msg = 'อีเมลนี้ถูกใช้ไปแล้ว';
      else if (user.phone === phone) msg = 'เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว';
      return res.json({ duplicate: true, message: msg });
    }
    res.json({ duplicate: false });
  });
});

module.exports = router;
