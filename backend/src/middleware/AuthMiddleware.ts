import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/appConfig';
import { redisService } from '../services/RedisService';
import { User } from '../models/User';
import { UnauthorizedError, ForbiddenError } from '../core/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    status: string;
    email: string;
  };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = '';

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. No token provided.');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, message: 'Token expired.', code: 'TOKEN_EXPIRED' });
        return;
      }
      throw new UnauthorizedError('Invalid token.');
    }

    const userId = decoded.id || decoded.userId || decoded.sub;
    if (!userId) {
      throw new UnauthorizedError('Invalid token payload: missing user identifier.');
    }

    // Attempt to load profile from Redis Cache first to prevent MongoDB DB overhead on every API request
    const cacheKey = `user:profile:${userId}`;
    let userDetails = await redisService.get<any>(cacheKey);

    if (!userDetails) {
      const { Admin } = require('../models/Admin');
      const adminRoles = [
        'Super Admin',
        'Admin',
        'Contest Manager',
        'Question Manager',
        'Finance Manager',
        'Support Manager',
        'Support Executive',
        'Marketing Manager',
        'Content Moderator',
        'KYC Officer',
        'Analytics Manager'
      ];
      
      let userDoc: any;
      if (decoded.role && adminRoles.includes(decoded.role)) {
        userDoc = await Admin.findById(userId).select('role status email name').exec();
      } else {
        userDoc = await User.findById(userId).select('role status email name').exec();
        if (!userDoc) {
          userDoc = await Admin.findById(userId).select('role status email name').exec();
        }
      }

      if (!userDoc) {
        throw new UnauthorizedError('User no longer exists.');
      }
      
      userDetails = {
        _id: userDoc._id.toString(),
        role: userDoc.role,
        status: userDoc.status,
        email: userDoc.email
      };
      
      // Store user cache representation in Redis
      await redisService.set(cacheKey, userDetails, 300);
    }

    if (userDetails.status === 'Banned') {
      throw new ForbiddenError('Your account has been suspended.');
    }

    if (userDetails.status === 'Locked') {
      throw new ForbiddenError('Your account is currently locked.');
    }

    req.user = {
      id: userDetails._id || userDetails.id,
      role: userDetails.role,
      status: userDetails.status,
      email: userDetails.email
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    // Super Admin is the main controller handling all features across the platform
    if (req.user.role === 'Super Admin' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return next(new ForbiddenError(`Forbidden: Restricted access. Requires: [${allowedRoles.join(', ')}].`));
  };
};

export const requireNotGuest = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required.'));
  }

  if (req.user.role === 'Guest') {
    res.status(403).json({
      success: false,
      message: 'Guest Mode: You are in view-only mode. Please register or sign in to participate in contests.'
    });
    return;
  }

  next();
};

export default authenticate;
