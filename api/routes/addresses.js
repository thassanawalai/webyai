const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all addresses for a user
router.get('/', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  db.all('SELECT * FROM addresses WHERE user_id = ?', [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add new address
router.post('/', (req, res) => {
  const { user_id, full_name, line1, line2, district, province, postcode, country, phone, type, is_default } = req.body;
  if (!user_id || !full_name || !line1 || !district || !province || !postcode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT INTO addresses (user_id, full_name, line1, line2, district, province, postcode, country, phone, type, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [user_id, full_name, line1, line2 || '', district, province, postcode, country || 'TH', phone || '', type || 'shipping', is_default ? 1 : 0],
    function (err) {
      if (err) return res.status(500).json({ error: 'Insert failed' });
      res.json({ id: this.lastID, success: true });
    }
  );
});

// Update address
router.put('/:id', (req, res) => {
  const { full_name, line1, line2, district, province, postcode, country, phone, type, is_default } = req.body;
  db.run(
    'UPDATE addresses SET full_name=?, line1=?, line2=?, district=?, province=?, postcode=?, country=?, phone=?, type=?, is_default=? WHERE address_id=?',
    [full_name, line1, line2, district, province, postcode, country, phone, type, is_default ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ success: true });
    }
  );
});

// Delete address
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM addresses WHERE address_id=?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ success: true });
  });
});

// Set default address
router.put('/:id/default', (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  db.serialize(() => {
    db.run('UPDATE addresses SET is_default=0 WHERE user_id=?', [user_id]);
    db.run('UPDATE addresses SET is_default=1 WHERE address_id=?', [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: 'Set default failed' });
      res.json({ success: true });
    });
  });
});

module.exports = router;
