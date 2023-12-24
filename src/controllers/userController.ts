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
  getChats,
  getChat,
  createMessage,
} from '../db/functions';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

export const provideUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const me = await getUserByUsername(req.user.username);
    res.status(200).json(`${JSON.stringify(me)}`);
  }
);

export const searchUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchId = Number(req.params.id);
    const user = await getUserById(searchId);
    if (!user) {
      res.status(400).json({ message: 'User does not exist' });
    } else {
      res.status(200).json(JSON.stringify(user));
    }
  }
);

export const searchUserByUsername = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserByUsername(req.body.requestedUser);
    if (!user) {
      res.status(400).json({ message: 'User does not exist' });
    } else {
      res.status(200).json(JSON.stringify(user));
    }
  }
);

export const findFriends = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('finding friends....');
    const friends = await getFriendsList(req.params.id);
    if (friends.length === 0) {
      res.status(200).json({ message: 'user has no friends' });
    } else res.status(200).json(`${JSON.stringify(friends)}`);
  }
);

export const sendFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userToAdd = await getUserByUsername(req.body.requestedUser);
    if (!userToAdd) {
      res.status(400).json({ message: 'User does not exist' });
    } else {
      const result = await addFriend({
        user_id1: req.user.id,
        user_id2: userToAdd.id,
      });
      if (!result) {
        res.status(500).json({
          message: 'there was an error processing this friend request',
        });
      } else {
        res
          .status(200)
          .json({ message: `friend request sent to ${userToAdd.username}` });
      }
    }
  }
);

export const viewFriendRequests = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const requests = await getFriendRequests(`${req.user.id}`);
    if (requests.length === 0) {
      res.status(200).json({ message: 'user has no friends' });
    } else {
      res.status(200).json(`${JSON.stringify(requests)}`);
    }
  }
);

export const acceptFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const friendId = Number(req.params.id);
    const newFriend = await acceptFriend(req.user.id, friendId);
    if (newFriend.length === 0) {
      res.status(400).json({ message: 'This user has not requested you' });
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
    const friendId = Number(req.params.id);
    const deletedFriendId = await deleteFriend(req.user.id, friendId);
    if (deletedFriendId.length === 0) {
      res
        .status(400)
        .json({ message: 'There is no relationship to this user' });
    } else {
      const deletedFriend = await getUserById(deletedFriendId[0].deletedId);
      res.status(200).json({
        message: `you have denied ${deletedFriend.username}'s friend request`,
      });
    }
  }
);

export const viewMyChats = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.id);
    const chats = await getChats(userId);
    if (!chats) {
      res.status(500).json({ message: `req.params.id = ${req.params.id}` });
    }
    if (chats.length === 0) {
      res.status(200).json({ message: 'user has no chats' });
    } else {
      res.status(200).json(`${JSON.stringify(chats)}, me: ${req.user.id}`);
    }
  }
);

export const newChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // check if requested user is friends with user
    const relationship = await checkFriendship(req.user.id, req.body.friendId);
    if (!relationship) {
      res
        .status(400)
        .json({ message: 'There is no relationship to this user' });
    }
    const chat = await createChat(req.user.id, req.body.friendId);
    res.status(200).json(JSON.stringify(chat));
  }
);

export const getMyChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const chatId = req.params.id;
    const chat = await getChat(chatId);
    if (!chat) {
      res
        .status(400)
        .json({ message: 'there is no chat between these two users' });
    } else {
      res.status(200).json(`${JSON.stringify(chat)}, me: ${req.user.id}`);
    }
  }
);

export const deleteMyChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const friendId = Number(req.params.id);
    const deletedChat = await deleteChat(req.user.id, friendId);
    if (!deletedChat) {
      res
        .status(400)
        .json({ message: 'There is no relationship to this user' });
    } else {
      res.status(200).json({ message: `chat ${deletedChat} has been deleted` });
    }
  }
);

export const sendMessage = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const message = await createMessage({
      body: req.body.message,
      chat_id: req.body.chatId,
      user_id: req.user.id,
    });
    if (!message) {
      res.status(500).json({ message: 'the message was not sent' });
    } else {
      res.status(200).json(JSON.stringify(message));
    }
  }
);
