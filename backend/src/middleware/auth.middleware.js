import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Not authenticated.' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};
