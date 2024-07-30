import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secret';
import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  console.log(token)

  if (!token) {
      return res.status(401).json({ message: 'Access token is missing or invalid' });
  }

  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user= decoded as User
      next();
  } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
  }
};