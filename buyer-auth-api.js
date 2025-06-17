// Node.js/Express API for buyer login/register/email verify/user update with MySQL
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: '*', // อนุญาตทุก origin (หรือจะระบุ origin เฉพาะก็ได้)
}));

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'alice_moist',
});

// สร้าง pool แทนการใช้ connection เดียว
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Register
// Register
app.post('/api/register', async (req, res) => {
  const { fullName, phone, address, province, district, postalCode, email, password } = req.body;
  
  if (!fullName || !phone || !address || !province || !district || !postalCode || !email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?', 
      [email, phone]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้แล้ว' });
    }

    const hash = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await pool.query(
      `INSERT INTO users (
        full_name, phone, address, province, 
        district, postal_code, email, password, verification_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, phone, address, province, district, postalCode, email, hash, verificationCode]
    );

    // ส่งอีเมลยืนยัน
    await transporter.sendMail({
      from: `"Alice Moist" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'ยืนยันอีเมล Alice Moist',
      html: `<p>รหัสยืนยัน 6 หลักของคุณคือ: <strong>${verificationCode}</strong></p>`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE email = ? OR phone = ?',
    [username, username],
    async (err, results) => {
      if (err || results.length === 0) return res.status(401).json({ error: 'User not found' });
      const user = results[0];
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
app.post('/api/verify-email', (req, res) => {
  const { email, code } = req.body;
  db.query('SELECT verification_code FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: 'ไม่พบผู้ใช้' });
    if (results[0].verification_code === code) {
      db.query('UPDATE users SET is_verified = 1, verification_code = NULL WHERE email = ?', [email], (err2) => {
        if (err2) return res.status(400).json({ error: 'อัปเดตสถานะไม่สำเร็จ' });
        res.json({ success: true });
      });
    } else {
      res.status(400).json({ error: 'รหัสยืนยันไม่ถูกต้อง' });
    }
  });
});

// Get user by email
app.get('/api/user', (req, res) => {
  const { email } = req.query;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = results[0];
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
app.post('/api/user-update', (req, res) => {
  const { email, fullName, phone, address } = req.body;
  db.query('UPDATE users SET full_name=?, phone=?, address=? WHERE email=?', [fullName, phone, address, email], (err, result) => {
    if (err) return res.status(400).json({ error: 'Update failed' });
    res.json({ success: true });
  });
});

// Reset password (user provides new password)
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  if (newPassword !== confirmPassword) return res.status(400).json({ error: 'รหัสผ่านใหม่ไม่ตรงกัน' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'ไม่พบอีเมลนี้ในระบบ' });
    const hash = await bcrypt.hash(newPassword, 10);
    db.query('UPDATE users SET password = ? WHERE email = ?', [hash, email], (err2) => {
      if (err2) return res.status(500).json({ error: 'อัปเดตรหัสผ่านไม่สำเร็จ' });
      // ส่งอีเมลแจ้งเตือน (optional)
      transporter.sendMail({
        from: `"Alice Moist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'เปลี่ยนรหัสผ่าน Alice Moist',
        html: `<p>คุณได้เปลี่ยนรหัสผ่านเรียบร้อยแล้ว หากไม่ได้เป็นผู้ดำเนินการ กรุณาติดต่อทีมงาน</p>`
      }, (err3, info) => {
        // ไม่ต้องเช็ค error อีเมลก็ได้
        res.json({ success: true });
      });
    });
  });
});

// Check duplicate email or phone
app.post('/api/check-duplicate', (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) return res.status(400).json({ duplicate: false, message: 'No data provided' });
  db.query(
    'SELECT * FROM users WHERE email = ? OR phone = ?',
    [email, phone],
    (err, results) => {
      if (err) return res.status(500).json({ duplicate: false, message: 'Database error' });
      if (results.length > 0) {
        let msg = 'ข้อมูลนี้ถูกใช้ไปแล้ว';
        if (results[0].email === email) msg = 'อีเมลนี้ถูกใช้ไปแล้ว';
        else if (results[0].phone === phone) msg = 'เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว';
        return res.json({ duplicate: true, message: msg });
      }
      res.json({ duplicate: false });
    }
  );
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log('API running on port', PORT));