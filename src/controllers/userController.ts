import { db } from '../db/db';
import { User } from '../db/schema';
import {
  addFriend,
  getFriendsList,
  getUserByUsername,
  acceptFriend,
  checkFriendship,
  createChat,
  deleteFriend,
  getFriendRequests,
  getUserById,
  deleteChat,
} from '../db/functions';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

export const findFriends = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('finding friends....');
    const friends = await getFriendsList(req.params.id);
    if (friends.length === 0) {
      res.status(404).json({ message: 'user has no friends' });
    } else res.status(200).json(`${JSON.stringify(friends)}`);
  }
);

export const sendFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userToAdd = await getUserByUsername(req.body.requestedUser);
    if (!userToAdd) {
      res.status(404).json({ message: 'User does not exist' });
    } else {
      const result = await addFriend({
        user_id1: req.user.id,
        user_id2: userToAdd.id,
      });
      res
        .status(200)
        .json({ message: `friend request sent to ${userToAdd.username}` });
    }
  }
);

export const viewFriendRequests = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const requests = await getFriendRequests(`${req.user.id}`);
    if (requests.length === 0) {
      res.status(404).json({ message: 'user has no friends' });
    } else {
      res.status(200).json(`${JSON.stringify(requests)}`);
    }
  }
);

export const acceptFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newFriend = await acceptFriend(req.user.id, req.body.friendId);
    if (newFriend.length === 0) {
      res.status(404).json({ message: 'This user has not requested you' });
    } else {
      const friend = await getUserById(newFriend[0].user_id2);
      res
        .status(200)
        .json({ message: `you have accepted ${friend.username}'s request` });
    }
  }
);

export const removeFriend = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const deletedFriendId = await deleteFriend(req.user.id, req.body.friendId);
    if (deletedFriendId.length === 0) {
      res
        .status(404)
        .json({ message: 'There is no relationship to this user' });
    } else {
      const deletedFriend = await getUserById(deletedFriendId[0].deletedId);
      res.status(200).json({
        message: `you have denied ${deletedFriend.username}'s friend request`,
      });
    }
  }
);

export const newChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // check if requested user is friends with user
    const relationship = await checkFriendship(req.user.id, req.body.friendId);
    if (!relationship) {
      res
        .status(404)
        .json({ message: 'There is no relationship to this user' });
    }
    const chat = await createChat(req.user.id, req.body.friendId);
    res.status(200).json(JSON.stringify(chat));
  }
);

export const deleteMyChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const deletedChat = await deleteChat(req.user.id, req.body.friendId);
    if (!deletedChat) {
      res
        .status(404)
        .json({ message: 'There is no relationship to this user' });
    } else {
      res.status(200).json({ message: `chat ${deletedChat} has been deleted` });
    }
  }
);
