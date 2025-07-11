const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const transporter = require('../mailer');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { fullName, phone, address, province, district, postalCode, email, password } = req.body;
  if (!fullName || !phone || !address || !province || !district || !postalCode || !email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
  }
  try {
    db.get('SELECT id FROM users WHERE email = ? OR phone = ?', [email, phone], async (err, existing) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (existing) {
        return res.status(409).json({ error: 'อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้แล้ว' });
      }
      const hash = await bcrypt.hash(password, 10);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      db.run(
        `INSERT INTO users (
          full_name, phone, address, province, 
          district, postal_code, email, password, verification_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [fullName, phone, address, province, district, postalCode, email, hash, verificationCode],
        async function (err2) {
          if (err2) return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
          await transporter.sendMail({
            from: `"Alice Moist" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'ยืนยันอีเมล Alice Moist',
            html: `<p>รหัสยืนยัน 6 หลักของคุณคือ: <strong>${verificationCode}</strong></p>`
          });
          res.json({ success: true });
        }
      );
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    'SELECT * FROM users WHERE email = ? OR phone = ?',
    [username, username],
    async (err, user) => {
      if (err || !user) return res.status(401).json({ error: 'User not found' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Incorrect password' });
      if (!user.is_verified) return res.status(403).json({ error: 'Email not verified' });
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
    }
  );
});

// Email verification
router.post('/verify-email', (req, res) => {
  const { email, code } = req.body;
  db.get('SELECT verification_code FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'ไม่พบผู้ใช้' });
    if (user.verification_code === code) {
      db.run('UPDATE users SET is_verified = 1, verification_code = NULL WHERE email = ?', [email], (err2) => {
        if (err2) return res.status(400).json({ error: 'อัปเดตสถานะไม่สำเร็จ' });
        res.json({ success: true });
      });
    } else {
      res.status(400).json({ error: 'รหัสยืนยันไม่ถูกต้อง' });
    }
  });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  if (newPassword !== confirmPassword) return res.status(400).json({ error: 'รหัสผ่านใหม่ไม่ตรงกัน' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'ไม่พบอีเมลนี้ในระบบ' });
    const hash = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE users SET password = ? WHERE email = ?', [hash, email], (err2) => {
      if (err2) return res.status(500).json({ error: 'อัปเดตรหัสผ่านไม่สำเร็จ' });
      transporter.sendMail({
        from: `"Alice Moist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'เปลี่ยนรหัสผ่าน Alice Moist',
        html: `<p>คุณได้เปลี่ยนรหัสผ่านเรียบร้อยแล้ว หากไม่ได้เป็นผู้ดำเนินการ กรุณาติดต่อทีมงาน</p>`
      }, () => {
        res.json({ success: true });
      });
    });
  });
});

module.exports = router;
