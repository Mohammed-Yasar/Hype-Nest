import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const router = express.Router();

// Validate Cloudinary env variables first
const requiredCloudinaryVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];
const missingCloudinaryVars = requiredCloudinaryVars.filter(
  (name) => !process.env[name] || !process.env[name].trim()
);

if (missingCloudinaryVars.length) {
  console.error(
    `Missing Cloudinary env vars: ${missingCloudinaryVars.join(', ')}`
  );
  throw new Error(
    `Missing Cloudinary env vars: ${missingCloudinaryVars.join(', ')}`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      file.originalname.toLowerCase().split('.').pop()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'hypenest',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result.secure_url) {
          resolve(result);
        } else {
          reject(new Error('No URL returned from Cloudinary'));
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// @route   POST /api/upload/image
// @desc    Upload image
// @access  Private
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const result = await uploadToCloudinary(req.file.buffer);
      res.json({
        url: result.secure_url,
      });
    } catch (error) {
      console.error("===== CLOUDINARY ERROR =====");
      console.dir(error, { depth: null });
      console.error("Type:", typeof error);
      console.error("Message:", error?.message);
      console.error("Name:", error?.name);
      console.error("Stack:", error?.stack);
      console.error("===========================");
      res.status(500).json({
        message: `Cloudinary upload failed: ${error.message}`,
      });
    }
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

export default router;