import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user profile (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get product count
    const productCount = await Product.countDocuments({ seller: user._id, status: 'approved' });

    res.json({
      _id: user._id,
      name: user.name,
      bio: user.bio || '',
      productCount,
      rating: 4.5, // Placeholder
      joinedAt: user.createdAt,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id/products
// @desc    Get products by seller
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find({ seller: req.params.id, status: 'approved' })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments({ seller: req.params.id, status: 'approved' });
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/me/favorites
// @desc    Toggle favorite product
// @access  Private
router.post('/me/favorites', protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle favorite
    const favoriteIndex = user.favorites.indexOf(productId);
    if (favoriteIndex > -1) {
      user.favorites.splice(favoriteIndex, 1);
    } else {
      user.favorites.push(productId);
    }

    await user.save();

    res.json({
      isFavorite: favoriteIndex === -1,
      favorites: user.favorites,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/me/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/me/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Populate full product details
    const favorites = await Product.find({ _id: { $in: user.favorites } })
      .populate('seller', 'name email');

    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

