// db.js - SQLite connection
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./e_commerce_alice_test1.db', (err) => {
  if (err) {
    console.error('SQLite connection error:', err);
  } else {
    console.log('Connected to SQLite');
  }
});
module.exports = db;
