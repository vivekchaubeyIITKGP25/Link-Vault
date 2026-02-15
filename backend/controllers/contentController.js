import { nanoid } from 'nanoid';
import Content from '../models/Content.js';
import { saveFileToLocal, deleteLocalFile, buildFileUrl } from '../config/storage.js';

const isOwnerViewer = (content, user) => {
  if (!content.owner || !user?._id) return false;
  return content.owner.toString() === user._id.toString();
};

const getOneTimeViewBlockMessage = (content, isOwner) => {
  if (!content.oneTimeView) return null;

  const ownerPreviewUsed = content.ownerPreviewUsed === true;
  const recipientViewUsed = content.recipientViewUsed === true;
  const legacyConsumed = content.hasBeenViewed === true && !ownerPreviewUsed && !recipientViewUsed;

  if (legacyConsumed) {
    return 'This content can only be viewed once and has already been accessed';
  }

  if (isOwner && ownerPreviewUsed) {
    return 'Owner preview for this one-time link has already been used';
  }

  if (!isOwner && recipientViewUsed) {
    return 'This one-time link has already been viewed by a recipient';
  }

  return null;
};

// Upload content (text or file)
export const uploadContent = async (req, res, next) => {
  try {
    const { textContent, expiryDateTime, expiryMinutes, password, oneTimeView, maxViews } = req.body;
    const file = req.file;

    // Validation: Must have either text or file
    if (!textContent && !file) {
      return res.status(400).json({
        success: false,
        message: 'Either text content or file must be provided'
      });
    }

    if (textContent && file) {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload both text and file. Choose one.'
      });
    }

    // Generate unique ID
    const uniqueId = nanoid(10);

    // Calculate expiry time: user-selected date/time or default minutes fallback
    let expiresAt;
    if (expiryDateTime) {
      const parsedExpiry = new Date(expiryDateTime);
      if (Number.isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiry date/time format'
        });
      }

      if (parsedExpiry.getTime() <= Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date/time must be in the future'
        });
      }

      expiresAt = parsedExpiry;
    } else {
      const expiryTime = parseInt(expiryMinutes, 10)
        || parseInt(process.env.DEFAULT_EXPIRY_MINUTES, 10)
        || 10;
      expiresAt = new Date(Date.now() + expiryTime * 60 * 1000);
    }

    // Create content object
    let contentData = {
      owner: req.user._id,
      uniqueId,
      expiresAt,
      password: password || null,
      oneTimeView: oneTimeView === 'true' || oneTimeView === true,
      maxViews: maxViews ? parseInt(maxViews) : null
    };

    // Handle text upload
    if (textContent) {
      contentData.type = 'text';
      contentData.textContent = textContent;
    }

    // Handle file upload
    if (file) {
      try {
        const savedFile = await saveFileToLocal(file, uniqueId);
        const fileUrl = buildFileUrl(uniqueId, savedFile.fileName);
        
        contentData.type = 'file';
        contentData.fileName = savedFile.fileName;
        contentData.filePath = savedFile.filePath;
        contentData.fileUrl = fileUrl;
        contentData.fileSize = file.size;
        contentData.mimeType = file.mimetype;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to save file to local storage',
          error: uploadError.message
        });
      }
    }

    // Save to database
    const content = await Content.create(contentData);

    res.status(201).json({
      success: true,
      message: 'Content uploaded successfully',
      data: {
        uniqueId: content.uniqueId,
        type: content.type,
        expiresAt: content.expiresAt,
        shareUrl: `${process.env.FRONTEND_URL}/view/${content.uniqueId}`
      }
    });

  } catch (error) {
    next(error);
  }
};

// Retrieve content by unique ID
export const getContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.query;

    // Find content
    const content = await Content.findOne({ uniqueId: id });

    if (!content) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or inaccessible link'
      });
    }

    const isOwner = isOwnerViewer(content, req.user);

    // Check if expired
    if (new Date() > content.expiresAt) {
      // Delete expired content
      if (content.type === 'file' && content.filePath) {
        await deleteLocalFile(content.filePath);
      }
      await Content.deleteOne({ _id: content._id });
      
      return res.status(410).json({
        success: false,
        message: 'Content has expired'
      });
    }

    // Check one-time access limits
    const oneTimeViewBlockMessage = getOneTimeViewBlockMessage(content, isOwner);
    if (oneTimeViewBlockMessage) {
      return res.status(410).json({
        success: false,
        message: oneTimeViewBlockMessage
      });
    }

    // Check max views
    if (content.maxViews && content.viewCount >= content.maxViews) {
      return res.status(410).json({
        success: false,
        message: 'Maximum view limit reached'
      });
    }

    // Check password
    if (content.password) {
      if (!password) {
        return res.status(401).json({
          success: false,
          message: 'Password required',
          requiresPassword: true
        });
      }

      if (password !== content.password) {
        return res.status(403).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    // Update view count and viewed status
    content.viewCount += 1;
    if (content.oneTimeView) {
      if (isOwner) {
        content.ownerPreviewUsed = true;
      } else {
        content.recipientViewUsed = true;
      }
      content.hasBeenViewed = content.ownerPreviewUsed === true || content.recipientViewUsed === true;
    }
    await content.save();

    // Prepare response
    const response = {
      success: true,
      data: {
        type: content.type,
        createdAt: content.createdAt,
        expiresAt: content.expiresAt,
        viewCount: content.viewCount,
        maxViews: content.maxViews
      }
    };

    if (content.type === 'text') {
      response.data.textContent = content.textContent;
    } else {
      response.data.fileName = content.fileName;
      response.data.fileUrl = content.fileUrl;
      response.data.fileSize = content.fileSize;
      response.data.mimeType = content.mimeType;
    }

    res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

// Delete content manually
export const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const content = await Content.findOne({ uniqueId: id });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (!content.owner || content.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this content'
      });
    }

    // Delete local file if it's a file upload
    if (content.type === 'file' && content.filePath) {
      await deleteLocalFile(content.filePath);
    }

    // Delete from database
    await Content.deleteOne({ _id: content._id });

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Get content info without incrementing view count (for password check)
export const getContentInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const content = await Content.findOne({ uniqueId: id });

    if (!content) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or inaccessible link'
      });
    }

    const isOwner = isOwnerViewer(content, req.user);

    // Check if expired
    if (new Date() > content.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'Content has expired'
      });
    }

    // Check one-time access limits
    const oneTimeViewBlockMessage = getOneTimeViewBlockMessage(content, isOwner);
    if (oneTimeViewBlockMessage) {
      return res.status(410).json({
        success: false,
        message: oneTimeViewBlockMessage
      });
    }

    // Check max views
    if (content.maxViews && content.viewCount >= content.maxViews) {
      return res.status(410).json({
        success: false,
        message: 'Maximum view limit reached'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        requiresPassword: !!content.password,
        type: content.type,
        expiresAt: content.expiresAt,
        oneTimeView: content.oneTimeView,
        isOwner
      }
    });

  } catch (error) {
    next(error);
  }
};

const mapOwnerContentItems = (items, baseUrl) => {
  const now = Date.now();

  return items.map((item) => ({
    uniqueId: item.uniqueId,
    type: item.type,
    fileName: item.fileName,
    createdAt: item.createdAt,
    expiresAt: item.expiresAt,
    viewCount: item.viewCount,
    maxViews: item.maxViews,
    oneTimeView: item.oneTimeView,
    hasBeenViewed: item.hasBeenViewed,
    isExpired: new Date(item.expiresAt).getTime() <= now,
    shareUrl: `${baseUrl}/view/${item.uniqueId}`
  }));
};

export const getRecentContent = async (req, res, next) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const items = await Content.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        items: mapOwnerContentItems(items, baseUrl)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getContentHistory = async (req, res, next) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const items = await Content.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        items: mapOwnerContentItems(items, baseUrl)
      }
    });
  } catch (error) {
    next(error);
  }
};
