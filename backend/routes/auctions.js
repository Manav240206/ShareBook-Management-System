const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Order = require('../models/Order');
const Book = require('../models/Book');

// Get all active auctions
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' }).populate('bookId sellerId');
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create an auction
router.post('/', async (req, res) => {
  try {
    const { bookId, sellerId, basePrice, endTime } = req.body;
    
    const newAuction = new Auction({
      bookId,
      sellerId,
      basePrice,
      currentHighestBid: basePrice,
      endTime
    });
    
    await newAuction.save();
    res.status(201).json({ message: 'Auction created successfully', auction: newAuction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place a bid
router.post('/:id/bid', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.sellerId.toString() === userId) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }
    if (auction.status !== 'active') return res.status(400).json({ message: 'Auction is not active' });
    if (new Date() > new Date(auction.endTime)) {
      auction.status = 'completed';
      await auction.save();
      return res.status(400).json({ message: 'Auction has ended' });
    }
    
    if (amount <= auction.currentHighestBid) {
      return res.status(400).json({ message: 'Bid amount must be higher than the current highest bid' });
    }
    
    // Register bid
    const bid = new Bid({
      auctionId: auction._id,
      userId,
      amount
    });
    await bid.save();
    
    // Update auction
    auction.currentHighestBid = amount;
    auction.highestBidder = userId;
    await auction.save();
    
    res.status(200).json({ message: 'Bid placed successfully', currentHighestBid: amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End an auction
router.post('/:id/end', async (req, res) => {
  try {
    const { userId } = req.body;
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.sellerId.toString() !== userId) {
      return res.status(403).json({ message: 'Only the seller can end this auction' });
    }
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is already ended' });
    }

    auction.status = 'completed';
    await auction.save();

    // If there is a highest bidder, create an order
    if (auction.highestBidder) {
      const orderItems = [{
        bookId: auction.bookId,
        price: auction.currentHighestBid
      }];

      const order = new Order({
        userId: auction.highestBidder,
        items: orderItems,
        totalAmount: auction.currentHighestBid,
        shippingAddress: 'Auction Winner - Please update profile',
        status: 'pending'
      });
      await order.save();

      // Mark book as sold
      await Book.findByIdAndUpdate(auction.bookId, { status: 'sold' });
    } else {
      // No bids placed, revert book to available
      await Book.findByIdAndUpdate(auction.bookId, { status: 'available' });
    }

    res.status(200).json({ message: 'Auction ended successfully', auction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
