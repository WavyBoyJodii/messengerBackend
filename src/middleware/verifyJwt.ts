import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { getUserById } from '../db/schema';
dotenv.config();
const jwtAccess = process.env.ACCESS_TOKEN_SECRET;

// Middleware to verify and decode the JWT token
export async function verifyJwtToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded: JwtPayload = jwt.verify(token, jwtAccess) as JwtPayload; // Use your actual secret key here
    const id = Number(decoded.sub);
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    req.user = user; // Store the decoded user data in the request object for later use
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
}
