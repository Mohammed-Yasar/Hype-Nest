import express from 'express';

const router = express.Router();

const isAllowed =
  process.env.NODE_ENV !== 'production' ||
  process.env.SHOW_ENV_DIAGNOSTICS === 'true';

const mask = (value) => {
  if (!value) return null;
  if (value.length <= 8) return `${value.slice(0, 2)}...${value.slice(-2)}`;
  return `${value.slice(0, 3)}...${value.slice(-3)}`;
};

router.get('/env', (req, res) => {
  if (!isAllowed) {
    return res.status(403).json({ message: 'Diagnostics disabled in production' });
  }

  res.json({
    CLOUDINARY_CLOUD_NAME: mask(process.env.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: mask(process.env.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: mask(process.env.CLOUDINARY_API_SECRET),
    NODE_ENV: process.env.NODE_ENV || null,
    SHOW_ENV_DIAGNOSTICS: process.env.SHOW_ENV_DIAGNOSTICS || null,
  });
});

export default router;
