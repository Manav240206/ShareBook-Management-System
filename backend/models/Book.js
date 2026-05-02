const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Acceptable'],
    default: 'Good',
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'auctioned'],
    default: 'available',
  },
  image: {
    type: String, // URL to image
    default: 'default-book.png',
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
