import express from 'express';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get products with search, filters, sort, pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    // Build query
    const query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Only show approved products in public feed
    query.status = 'approved';

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Product.countDocuments(query);
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
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name email'
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create product
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, price, brand, category, images } = req.body;

    if (!title || !description || !price || !brand || !category) {
      return res.status(400).json({
        message: 'Please provide title, description, price, brand, and category',
      });
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      brand,
      category,
      images: Array.isArray(images) ? images : images ? [images] : [],
      seller: req.user._id,
      status: 'pending',
    });

    const populatedProduct = await Product.findById(product._id).populate(
      'seller',
      'name email'
    );

    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/user/my-products
// @desc    Get current user's products
// @access  Private
router.get('/user/my-products', protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/products/:id
// @desc    Update product (owner only)
// @access  Private
router.patch('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { title, description, price, brand, category, images } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (brand) product.brand = brand;
    if (category) product.category = category;
    if (images !== undefined) {
      product.images = Array.isArray(images) ? images : images ? [images] : [];
    }

    // Reset status to pending if product was edited
    if (product.status === 'approved') {
      product.status = 'pending';
    }

    await product.save();

    const populatedProduct = await Product.findById(product._id).populate(
      'seller',
      'name email'
    );

    res.json(populatedProduct);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (owner only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;

