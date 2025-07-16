const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get product by id
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

// Add new product
router.post('/', (req, res) => {
  const { name, description, price, stock, image } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Missing required fields' });
  db.run(
    'INSERT INTO products (name, description, price, stock, image) VALUES (?, ?, ?, ?, ?)',
    [name, description || '', price, stock || 0, image || ''],
    function (err) {
      if (err) return res.status(500).json({ error: 'Insert failed' });
      res.json({ id: this.lastID, success: true });
    }
  );
});

// Update product
router.put('/:id', (req, res) => {
  const { name, description, price, stock, image } = req.body;
  db.run(
    'UPDATE products SET name=?, description=?, price=?, stock=?, image=? WHERE id=?',
    [name, description, price, stock, image, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ success: true });
    }
  );
});

// Delete product
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ success: true });
  });
});

module.exports = router;
