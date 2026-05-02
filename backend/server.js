const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (to be implemented)
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const auctionRoutes = require('./routes/auctions');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/orders', orderRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sharebook')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('ShareBook Management System API is running');
});

// We only export the app for testing or serverless deployment if needed
// The server won't be started automatically here based on your preferences
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
