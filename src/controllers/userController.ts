import { db } from '../db/db';
import {
  User,
  acceptFriend,
  getFriendRequests,
  getUserById,
} from '../db/schema';
import { addFriend, getFriendsList, getUserByUsername } from '../db/schema';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

export const findFriends = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('finding friends....');
    const friends = await getFriendsList(req.params.id);
    if (friends.length === 0)
      res.status(404).json({ message: 'user has no friends' });
    res.status(200).json(`${JSON.stringify(friends)}`);
  }
);

export const sendFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userToAdd = await getUserByUsername(req.body.requestedUser);
    if (!userToAdd) res.status(404).json({ message: 'User does not exist' });
    const result = await addFriend({
      user_id1: req.body.userId,
      user_id2: userToAdd.id,
    });
    res
      .status(200)
      .json({ message: `friend request sent to ${userToAdd.username}` });
  }
);

export const viewFriendRequests = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const requests = await getFriendRequests(req.params.id);
    if (requests.length === 0)
      res.status(404).json({ message: 'user has no friends' });
    res.status(200).json(`${JSON.stringify(requests)}`);
  }
);

export const acceptFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newFriend = await acceptFriend(req.body.myId, req.body.friendId);
    if (newFriend.length === 0)
      res.status(404).json({ message: 'This user has not requested you' });
    const friend = await getUserById(newFriend[0].user_id2);
    res
      .status(200)
      .json({ message: `you have accepted ${friend.username}'s request` });
  }
);
