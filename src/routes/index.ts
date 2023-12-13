import { db } from '../db/db';
import { User } from '../db/schema';
import { eq } from 'drizzle-orm';
import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* test db get user */
router.get('/find', async function (req, res, next) {
  const result = await db
    .select()
    .from(User)
    .where(eq(User.username, 'wavyboyjodii'));
  res.status(200).json({ user: JSON.stringify(result) });
});

export default router;
