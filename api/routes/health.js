const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.get('SELECT 1', (err) => {
    if (err) {
      console.error('SQLite health check failed:', err);
      return res.status(500).json({ status: 'DOWN', error: err.message });
    }
    res.json({ status: 'UP' });
  });
});

module.exports = router;
