import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getAuthUserFromHeader = async (authorizationHeader) => {
  const header = authorizationHeader || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'linkvault-dev-secret');
  const user = await User.findById(decoded.userId).select('_id name email');
  return user || null;
};

export const requireAuth = async (req, res, next) => {
  try {
    const user = await getAuthUserFromHeader(req.headers.authorization);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or missing authentication token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const user = await getAuthUserFromHeader(req.headers.authorization);
    req.user = user;
    next();
  } catch (error) {
    // For public endpoints we ignore bad tokens and continue as anonymous.
    req.user = null;
    next();
  }
};
