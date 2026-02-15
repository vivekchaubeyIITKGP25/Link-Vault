import express from 'express';
import {
  uploadContent,
  getContent,
  deleteContent,
  getContentInfo,
  getRecentContent,
  getContentHistory
} from '../controllers/contentController.js';
import upload from '../middleware/upload.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Upload content (text or file)
router.post('/upload', requireAuth, upload.single('file'), uploadContent);

// Recent content for the owner
router.get('/content/recent', requireAuth, getRecentContent);

// Full link history for the owner
router.get('/content/history', requireAuth, getContentHistory);

// Get content info (for password check)
router.get('/content/:id/info', optionalAuth, getContentInfo);

// Retrieve content
router.get('/content/:id', optionalAuth, getContent);

// Delete content manually
router.delete('/content/:id', requireAuth, deleteContent);

export default router;
