import { db } from '../db/db';
import { User } from '../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { createUser, getUserByUsername } from '../db/schema';
import * as dotenv from 'dotenv';
dotenv.config();
const jwtAccess = process.env.ACCESS_TOKEN_SECRET;

export const signUp = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const existingUser = await getUserByUsername(req.body.username);
    if (existingUser) {
      res.status(400).json({ message: 'this username already exists' });
      return;
    }
    // Hash the password with bcryptjs
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const lowerCaseUsername = req.body.username.toLowerCase();

    const result = await createUser({
      email: req.body.email,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      password: hashedPass,
      username: lowerCaseUsername,
      profile_photo: req.body?.profile_photo,
    });
    const newUser = result[0];
    res
      .status(200)
      .json({ message: `new Account created for ${newUser.username}` });
  }
);
