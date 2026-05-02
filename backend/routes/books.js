const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get all available books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({ status: 'available' }).populate('sellerId', 'name email');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get books by sellerId
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const books = await Book.find({ sellerId: req.params.sellerId });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new book (Sell Book)
router.post('/', async (req, res) => {
  try {
    const { title, author, description, price, condition, image, sellerId } = req.body;
    
    const newBook = new Book({
      title,
      author,
      description,
      price,
      condition,
      image,
      sellerId
    });
    
    await newBook.save();
    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('sellerId', 'name email');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a book
router.put('/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json({ message: 'Book updated successfully', book: updatedBook });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
