import { db } from '../db/db';
import { User, getFriendsList } from '../db/schema';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

export const findFriends = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const friends = await getFriendsList(req.params.id);
    if (friends.length === 0)
      res.status(404).json({ message: 'user has no friends' });
    res.status(200).json(`${JSON.stringify(friends)}`);
  }
);
