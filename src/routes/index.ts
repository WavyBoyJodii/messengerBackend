import { db } from '../db/db';
import { User, UserType } from '../db/schema';
import { eq } from 'drizzle-orm';
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import { validateCheck } from '../middleware/validateCheck';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import * as validation from '../lib/validations';
import * as dotenv from 'dotenv';
import { signUp } from '../controllers/authController';
dotenv.config();
const jwtAccess = process.env.ACCESS_TOKEN_SECRET;
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Handle post login page
router.post('/login', (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false, failureMessage: true },
    (err: Error, user: any, info: any) => {
      if (err || !user) {
        return res.status(400).json({
          info,
          // err: err ? err.message : 'User not found',
        });
      }
      req.login(user, (err) => {
        if (err) {
          res.status(400).json({ err });
        }
        const token = jwt.sign({ sub: user.id }, jwtAccess);
        const username = user.username;
        const userId = user.id;
        return res.status(200).json({ username, userId, token });
      });
    }
  )(req, res);
});

//Handle POST Sign up
router.post('/sign-up', validation.register, validateCheck, signUp);

/* test db get user */
router.get('/find', async function (req, res, next) {
  const result = await db
    .select()
    .from(User)
    .where(eq(User.username, 'wavyboyjodii'));
  res.status(200).json({ user: JSON.stringify(result) });
});

export default router;
