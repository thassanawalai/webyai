const express = require('express');
const db = require('../db');
const router = express.Router();
// Register user (สำหรับสมัครสมาชิก buyer)
router.post('/register', (req, res) => {
  const { user_name, user_email, user_password, user_role, user_profile_img, phone } = req.body;
  if (!user_name || !user_email || !user_password || !user_role || !phone) {
    return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
  }
  // เช็คเบอร์โทรศัพท์ซ้ำก่อน
  db.get('SELECT user_id FROM users WHERE phone = ?', [phone], (err, user) => {
    if (err) return res.status(500).json({ success: false, error: 'Database error' });
    if (user) return res.status(409).json({ success: false, error: 'เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว' });
    // ถ้าเบอร์ไม่ซ้ำ เช็คอีเมลต่อ
    db.get('SELECT user_id FROM users WHERE user_email = ?', [user_email], (err2, user2) => {
      if (err2) return res.status(500).json({ success: false, error: 'Database error' });
      if (user2) return res.status(409).json({ success: false, error: 'อีเมลนี้ถูกใช้ไปแล้ว' });
      // สมัครสมาชิกใหม่
      db.run(
        'INSERT INTO users (user_name, user_email, user_password, user_role, user_profile_img, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [user_name, user_email, user_password, user_role, user_profile_img || '', phone],
        function(err3) {
          if (err3) return res.status(500).json({ success: false, error: 'Register failed' });
          // ดึงข้อมูล user ที่สมัครใหม่
          db.get('SELECT * FROM users WHERE user_id = ?', [this.lastID], (err4, newUser) => {
            if (err4 || !newUser) return res.status(500).json({ success: false, error: 'Cannot fetch user after register' });
            res.json({
              success: true,
              user_id: newUser.user_id,
              user_name: newUser.user_name,
              user_email: newUser.user_email,
              user_role: newUser.user_role,
              user_profile_img: newUser.user_profile_img,
              user_created_at: newUser.user_created_at,
              phone: newUser.phone,
              email_verified_at: newUser.email_verified_at,
              default_address_id: newUser.default_address_id
            });
          });
        }
      );
    });
  });
});

// Get user by email or phone (สำหรับ login/register)
router.post('/by-email-or-phone', (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) return res.status(400).json({ error: 'No data provided' });
  // ล็อกอิน: เช็ค phone ก่อน ถ้าไม่เจอค่อยเช็ค email
  if (phone) {
    db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (user) {
        return res.json({
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
      }
      // ถ้าไม่เจอ phone ให้เช็ค email ต่อ
      if (email) {
        db.get('SELECT * FROM users WHERE user_email = ?', [email], (err2, user2) => {
          if (err2) return res.status(500).json({ error: 'Database error' });
          if (user2) {
            return res.json({
              user_id: user2.user_id,
              user_name: user2.user_name,
              user_email: user2.user_email,
              user_role: user2.user_role,
              user_profile_img: user2.user_profile_img,
              user_created_at: user2.user_created_at,
              phone: user2.phone,
              email_verified_at: user2.email_verified_at,
              default_address_id: user2.default_address_id
            });
          }
          return res.status(404).json({ error: 'User not found' });
        });
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    });
  } else if (email) {
    db.get('SELECT * FROM users WHERE user_email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (user) {
        return res.json({
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
      }
      return res.status(404).json({ error: 'User not found' });
    });
  }
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
  // เช็คซ้ำแยก field
  if (email && phone) {
    db.get('SELECT user_email FROM users WHERE user_email = ?', [email], (err, userEmail) => {
      if (err) return res.status(500).json({ duplicate: false, message: 'Database error' });
      db.get('SELECT phone FROM users WHERE phone = ?', [phone], (err2, userPhone) => {
        if (err2) return res.status(500).json({ duplicate: false, message: 'Database error' });
        if (userEmail && userPhone) {
          return res.json({ duplicate: true, message: 'อีเมลและเบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว' });
        } else if (userEmail) {
          return res.json({ duplicate: true, message: 'อีเมลนี้ถูกใช้ไปแล้ว' });
        } else if (userPhone) {
          return res.json({ duplicate: true, message: 'เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว' });
        } else {
          return res.json({ duplicate: false });
        }
      });
    });
  } else if (email) {
    db.get('SELECT user_email FROM users WHERE user_email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ duplicate: false, message: 'Database error' });
      if (user) return res.json({ duplicate: true, message: 'อีเมลนี้ถูกใช้ไปแล้ว' });
      return res.json({ duplicate: false });
    });
  } else if (phone) {
    db.get('SELECT phone FROM users WHERE phone = ?', [phone], (err, user) => {
      if (err) return res.status(500).json({ duplicate: false, message: 'Database error' });
      if (user) return res.json({ duplicate: true, message: 'เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว' });
      return res.json({ duplicate: false });
    });
  }
});

module.exports = router;

// Check duplicate phone only
router.post('/check-duplicate-phone', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ duplicate: false, message: 'No phone provided' });
  db.get('SELECT phone FROM users WHERE phone = ?', [phone], (err, user) => {
    if (err) return res.status(500).json({ duplicate: false, message: 'Database error' });
    if (user) return res.json({ duplicate: true, message: 'เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว' });
    return res.json({ duplicate: false });
  });
});

// Check duplicate email only
router.post('/check-duplicate-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ duplicate: false, message: 'No email provided' });
  db.get('SELECT user_email FROM users WHERE user_email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ duplicate: false, message: 'Database error' });
    if (user) return res.json({ duplicate: true, message: 'อีเมลนี้ถูกใช้ไปแล้ว' });
    return res.json({ duplicate: false });
  });
});
