const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: '*' }));

// Serve static files for buyer, seller, and public folders
const path = require('path');
app.use('/buyer', express.static(path.join(__dirname, '../buyer')));
app.use('/seller', express.static(path.join(__dirname, '../seller')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/health', require('./routes/health'));

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}`);
});
