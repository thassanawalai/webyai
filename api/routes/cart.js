const express = require('express');
const db = require('../db');
const router = express.Router();

// Get cart for a user (with items)
router.get('/', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  db.get('SELECT * FROM cart WHERE user_id = ?', [user_id], (err, cart) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!cart) return res.json({ items: [] });
    db.all('SELECT * FROM cart_items WHERE cart_id = ?', [cart.cart_id], (err2, items) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json({ cart_id: cart.cart_id, items });
    });
  });
});

// Add item to cart
router.post('/items', (req, res) => {
  const { user_id, variant_id, quantity } = req.body;
  if (!user_id || !variant_id) return res.status(400).json({ error: 'Missing required fields' });
  db.get('SELECT * FROM cart WHERE user_id = ?', [user_id], (err, cart) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const addItem = (cart_id) => {
      db.run('INSERT OR REPLACE INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?)', [cart_id, variant_id, quantity || 1], function (err2) {
        if (err2) return res.status(500).json({ error: 'Add item failed' });
        res.json({ success: true });
      });
    };
    if (cart) {
      addItem(cart.cart_id);
    } else {
      db.run('INSERT INTO cart (user_id) VALUES (?)', [user_id], function (err2) {
        if (err2) return res.status(500).json({ error: 'Create cart failed' });
        addItem(this.lastID);
      });
    }
  });
});

// Update item quantity
router.put('/items/:variant_id', (req, res) => {
  const { user_id, quantity } = req.body;
  if (!user_id || !quantity) return res.status(400).json({ error: 'Missing required fields' });
  db.get('SELECT * FROM cart WHERE user_id = ?', [user_id], (err, cart) => {
    if (err || !cart) return res.status(404).json({ error: 'Cart not found' });
    db.run('UPDATE cart_items SET quantity=? WHERE cart_id=? AND variant_id=?', [quantity, cart.cart_id, req.params.variant_id], function (err2) {
      if (err2) return res.status(500).json({ error: 'Update failed' });
      res.json({ success: true });
    });
  });
});

// Remove item from cart
router.delete('/items/:variant_id', (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  db.get('SELECT * FROM cart WHERE user_id = ?', [user_id], (err, cart) => {
    if (err || !cart) return res.status(404).json({ error: 'Cart not found' });
    db.run('DELETE FROM cart_items WHERE cart_id=? AND variant_id=?', [cart.cart_id, req.params.variant_id], function (err2) {
      if (err2) return res.status(500).json({ error: 'Delete failed' });
      res.json({ success: true });
    });
  });
});

// Clear cart
router.delete('/clear', (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  db.get('SELECT * FROM cart WHERE user_id = ?', [user_id], (err, cart) => {
    if (err || !cart) return res.status(404).json({ error: 'Cart not found' });
    db.run('DELETE FROM cart_items WHERE cart_id=?', [cart.cart_id], function (err2) {
      if (err2) return res.status(500).json({ error: 'Clear failed' });
      res.json({ success: true });
    });
  });
});

module.exports = router;
