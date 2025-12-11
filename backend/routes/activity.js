import express from 'express';
import Activity from '../models/Activity.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/activity
// @desc    Get recent activity feed
// @access  Public
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activities = await Activity.find()
      .populate('user', 'name')
      .populate('product', 'title images')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/activity
// @desc    Create activity (admin/system only)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { type, user, product, message, metadata } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: 'Type and message are required' });
    }

    const activity = await Activity.create({
      type,
      user: user || null,
      product: product || null,
      message,
      metadata: metadata || {},
    });

    const populatedActivity = await Activity.findById(activity._id)
      .populate('user', 'name')
      .populate('product', 'title images');

    res.status(201).json(populatedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

