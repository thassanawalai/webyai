const express = require('express');
const db = require('../db');
const router = express.Router();

// Create new order
router.post('/', (req, res) => {
  const { user_id, items, total_price, address, status } = req.body;
  if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing order data' });
  }
  db.run(
    'INSERT INTO orders (user_id, items, total_price, address, status, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
    [user_id, JSON.stringify(items), total_price, address, status || 'pending'],
    function (err) {
      if (err) return res.status(500).json({ error: 'Order creation failed' });
      res.json({ id: this.lastID, success: true });
    }
  );
});

// Get all orders (optionally filter by user_id)
router.get('/', (req, res) => {
  const { user_id } = req.query;
  let sql = 'SELECT * FROM orders';
  let params = [];
  if (user_id) {
    sql += ' WHERE user_id = ?';
    params.push(user_id);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows.map(row => ({ ...row, items: JSON.parse(row.items) })));
  });
});

// Get order by id
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Order not found' });
    row.items = JSON.parse(row.items);
    res.json(row);
  });
});

// Update order status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });
  db.run('UPDATE orders SET status=? WHERE id=?', [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ success: true });
  });
});

module.exports = router;
