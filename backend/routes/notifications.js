import express from 'express';
import Notification from '../models/Notification.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications/me
// @desc    Get current user's notifications
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/notifications/me/read-all
// @desc    Mark all notifications as read
// @access  Private
router.patch('/me/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/notifications
// @desc    Create notification (admin/system only)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { user, type, title, message, link, metadata } = req.body;

    if (!user || !type || !title || !message) {
      return res.status(400).json({ message: 'User, type, title, and message are required' });
    }

    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      link: link || null,
      metadata: metadata || {},
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

