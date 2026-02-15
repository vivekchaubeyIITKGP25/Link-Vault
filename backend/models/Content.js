import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['text', 'file'],
    required: true
  },
  // For text content
  textContent: {
    type: String,
    default: null
  },
  // For file content
  fileName: {
    type: String,
    default: null
  },
  fileUrl: {
    type: String,
    default: null
  },
  filePath: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  mimeType: {
    type: String,
    default: null
  },
  // Optional features
  password: {
    type: String,
    default: null
  },
  oneTimeView: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  maxViews: {
    type: Number,
    default: null
  },
  // Expiry
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Track if already viewed (for one-time links)
  hasBeenViewed: {
    type: Boolean,
    default: false
  },
  // Owner preview allowance for one-time links
  ownerPreviewUsed: {
    type: Boolean,
    default: false
  },
  // Single recipient allowance for one-time links
  recipientViewUsed: {
    type: Boolean,
    default: false
  }
});

const Content = mongoose.model('Content', contentSchema);

export default Content;
