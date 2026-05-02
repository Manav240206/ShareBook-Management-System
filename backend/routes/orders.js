const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Place an order
router.post('/checkout', async (req, res) => {
  try {
    const { userId, items, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate total amount from the frontend passed items
    let totalAmount = 0;
    const orderItems = items.map(item => {
      totalAmount += item.price;
      return {
        bookId: item.bookId,
        price: item.price
      };
    });
    
    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'pending'
    });
    
    await order.save();
    
    // Update book statuses to 'sold'
    const Book = require('../models/Book');
    for (const item of orderItems) {
      await Book.findByIdAndUpdate(item.bookId, { status: 'sold' });
    }
    
    res.status(201).json({ message: 'Order placed successfully via COD', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (Admin only)
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.bookId');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('items.bookId');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Admin/Delivery)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
