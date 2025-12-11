import express from 'express';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/products/pending
// @desc    Get all pending products
// @access  Private/Admin
router.get('/products/pending', protect, admin, async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending' })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/admin/products/:id/approve
// @desc    Approve product
// @access  Private/Admin
router.patch('/products/:id/approve', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = 'approved';
    await product.save();

    const populatedProduct = await Product.findById(product._id).populate(
      'seller',
      'name email'
    );

    // Create notification for seller
    try {
      await Notification.create({
        user: product.seller,
        type: 'product_approved',
        title: 'Product Approved',
        message: `Your product "${product.title}" has been approved and is now live!`,
        link: `/products/${product._id}`,
      });
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }

    // Create activity
    try {
      await Activity.create({
        type: 'product_approved',
        user: product.seller,
        product: product._id,
        message: `${populatedProduct.seller.name}'s product "${product.title}" was approved`,
      });
    } catch (activityErr) {
      console.error('Failed to create activity:', activityErr);
    }

    res.json(populatedProduct);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/admin/products/:id/reject
// @desc    Reject product
// @access  Private/Admin
router.patch('/products/:id/reject', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = 'rejected';
    await product.save();

    const populatedProduct = await Product.findById(product._id).populate(
      'seller',
      'name email'
    );

    // Create notification for seller
    try {
      await Notification.create({
        user: product.seller,
        type: 'product_rejected',
        title: 'Product Rejected',
        message: `Your product "${product.title}" has been rejected. Please review and resubmit.`,
        link: `/dashboard`,
      });
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }

    res.json(populatedProduct);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;

