import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

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

    res.json(populatedProduct);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;

