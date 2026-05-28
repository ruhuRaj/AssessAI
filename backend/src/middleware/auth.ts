import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthUser } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'veda-dev-secret-change-in-production';

export function signToken(userId: string, email: string, name: string): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign({ sub: userId, email, name }, JWT_SECRET, { expiresIn });
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      name: string;
    };

    const user = await User.findById(payload.sub).select('_id email name');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      name: user.name,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export function toPublicUser(user: {
  _id: unknown;
  name: string;
  email: string;
  schoolName?: string;
  profileImageUrl?: string;
  createdAt?: Date;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    schoolName: user.schoolName,
    profileImageUrl: user.profileImageUrl,
    createdAt: user.createdAt,
  };
}
