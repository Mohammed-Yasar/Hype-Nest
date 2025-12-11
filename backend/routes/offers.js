import express from 'express';
import Offer from '../models/Offer.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/offers
// @desc    Create an offer
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, amount, message } = req.body;

    if (!productId || !amount) {
      return res.status(400).json({ message: 'Product ID and amount are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Can't offer on your own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot make an offer on your own product' });
    }

    // Can't offer if product is not approved
    if (product.status !== 'approved') {
      return res.status(400).json({ message: 'You can only make offers on approved products' });
    }

    // Check for existing pending offer from this buyer
    const existingOffer = await Offer.findOne({
      product: productId,
      buyer: req.user._id,
      status: 'pending',
    });

    if (existingOffer) {
      return res.status(400).json({ message: 'You already have a pending offer on this product' });
    }

    const offer = await Offer.create({
      product: productId,
      buyer: req.user._id,
      amount: Number(amount),
      message: message || '',
      status: 'pending',
    });

    const populatedOffer = await Offer.findById(offer._id)
      .populate('buyer', 'name')
      .populate('product', 'title price seller');

    res.status(201).json(populatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/offers/me
// @desc    Get current user's offers
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const offers = await Offer.find({ buyer: req.user._id })
      .populate('product', 'title images price seller')
      .populate('product.seller', 'name')
      .sort({ createdAt: -1 });

    res.json({ offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/offers/product/:productId
// @desc    Get offers for a product (seller only)
// @access  Private
router.get('/product/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only seller can see offers
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view offers for this product' });
    }

    const offers = await Offer.find({ product: req.params.productId })
      .populate('buyer', 'name')
      .sort({ createdAt: -1 });

    res.json({ offers });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/offers/:id/accept
// @desc    Accept an offer (seller only)
// @access  Private
router.patch('/:id/accept', protect, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('product');
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const product = await Product.findById(offer.product._id);
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this offer' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending offers can be accepted' });
    }

    // Accept this offer and reject others
    await Offer.updateMany(
      { product: offer.product._id, status: 'pending', _id: { $ne: offer._id } },
      { status: 'rejected' }
    );

    offer.status = 'accepted';
    await offer.save();

    const populatedOffer = await Offer.findById(offer._id)
      .populate('buyer', 'name')
      .populate('product', 'title price');

    res.json(populatedOffer);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/offers/:id/reject
// @desc    Reject an offer (seller only)
// @access  Private
router.patch('/:id/reject', protect, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('product');
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const product = await Product.findById(offer.product._id);
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this offer' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending offers can be rejected' });
    }

    offer.status = 'rejected';
    await offer.save();

    const populatedOffer = await Offer.findById(offer._id)
      .populate('buyer', 'name')
      .populate('product', 'title price');

    res.json(populatedOffer);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/offers/:id/withdraw
// @desc    Withdraw an offer (buyer only)
// @access  Private
router.patch('/:id/withdraw', protect, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to withdraw this offer' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending offers can be withdrawn' });
    }

    offer.status = 'withdrawn';
    await offer.save();

    res.json(offer);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;

