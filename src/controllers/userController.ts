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
  getChatById,
} from '../db/functions';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { pusher } from '../lib/pusher';
import { openai } from '../lib/openAi';

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
      res.status(200).json({
        username: `${user.username}`,
        userId: `${user.id}`,
        profilePhoto: `${user.profile_photo}`,
        email: `${user.email}`,
      });
    }
  }
);

export const searchUserByUsername = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserByUsername(req.params.username);
    if (!user) {
      res.status(400).json({ message: 'User does not exist' });
    } else {
      res.status(200).json({
        username: user.username,
        id: user.id,
        profilePhoto: user.profile_photo,
        email: user.email,
      });
    }
  }
);

export const findFriends = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('finding friends....');
    const friends = await getFriendsList(req.params.id);
    res.status(200).json(`${JSON.stringify(friends)}`);
  }
);

export const sendFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserById(req.body.requestedUser);
    const relation = await checkFriendship(
      req.body.userId,
      req.body.requestedUser
    );
    if (!relation) {
      const result = await addFriend({
        user_id1: req.body.userId,
        user_id2: req.body.requestedUser,
      });
      if (!result) {
        res.status(500).json({
          message: 'there was an error processing this friend request',
        });
      } else {
        res
          .status(200)
          .json({ message: `friend request sent to ${user.username}` });
      }
    } else {
      if (relation.status === 'accepted') {
        res.status(200).json({ message: 'User is already your friend' });
      } else {
        res.status(200).json({ message: 'User has already been requested' });
      }
    }
  }
);

export const viewFriendRequests = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const requests = await getFriendRequests(req.params.id);

    res.status(200).json(JSON.stringify(requests));
  }
);

export const acceptFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const friendId = Number(req.body.friendId);
    const myId = Number(req.body.userId);
    const newFriend = await acceptFriend(myId, friendId);
    if (newFriend.length === 0) {
      res.status(200).json({ message: 'This user has not requested you' });
    } else {
      const friend = await getUserById(friendId);
      res
        .status(200)
        .json({ message: `you have accepted ${friend.username}'s request` });
    }
  }
);

export const removeFriend = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const friendAndUser = req.params.id.split('--');
    const friendId = Number(friendAndUser[0]);
    const myId = Number(friendAndUser[1]);
    const deletedFriendId = await deleteFriend(myId, friendId);
    if (deletedFriendId.length === 0) {
      res
        .status(400)
        .json({ message: 'There is no relationship to this user' });
    } else {
      const deletedFriend = await getUserById(friendId);
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
    } else {
      // pusher.trigger(`chats-${req.params.id}`, 'mychats', {
      //   chats: JSON.stringify(chats),
      // });
      res.status(200).json(chats);
    }
  }
);

export const newChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // check if requested user is friends with user
    const relationship = await checkFriendship(
      req.body.userId,
      req.body.friendId
    );
    if (!relationship) {
      res
        .status(400)
        .json({ message: 'There is no relationship to this user' });
    }
    // check if a chat already exists between the users
    const chatId1 = `${req.body.userId}--${req.body.friendId}`;
    const chatId2 = `${req.body.friendId}--${req.body.userId}`;
    const oldChat1 = await getChat(chatId1);
    const oldChat2 = await getChat(chatId2);
    if (!oldChat1 && !oldChat2) {
      const newChat = await createChat(req.body.userId, req.body.friendId);
      const userChats = await getChats(req.body.userId);
      const friendChats = await getChats(req.body.friendId);
      pusher.trigger(`chats-${req.body.userId}`, 'mychats', {
        chat: JSON.stringify(newChat[0]),
      });
      pusher.trigger(`chats-${req.body.friendId}`, 'mychats', {
        chat: JSON.stringify(newChat[0]),
      });
      res.status(200).json({ chat: newChat[0] });
    } else {
      if (oldChat1) {
        res.status(200).json({ chat: oldChat1 });
      } else {
        res.status(200).json({ chat: oldChat2 });
      }
    }
  }
);

export const getMyChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const chatId = req.params.id;
    const chat = await getChat(chatId);

    res.status(200).json(chat);
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
      user_id: req.body.userId,
    });
    if (!message) {
      res.status(500).json({ message: 'the message was not sent' });
    } else {
      const chat = await getChatById(req.body.chatId);
      const friendId =
        chat.user_id1 === Number(req.body.userId)
          ? chat.user_id2
          : chat.user_id1;

      pusher.trigger(`messages-${chat.id}-${req.body.userId}`, 'mychats', {
        chat: JSON.stringify(chat),
      });
      pusher.trigger(`messages-${chat.id}-${friendId}`, 'mychats', {
        chat: JSON.stringify(chat),
      });

      pusher.trigger(`messages-${req.body.chatId}`, 'new-message', {
        message: JSON.stringify(message[0]),
      });
      res.status(200).json(message);
    }
  }
);

export const aiChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(
      `logging messages in aichat req body ${JSON.stringify(req.body.message)}`
    );
    const chatCompletion = await openai.chat.completions.create({
      messages: req.body.message,
      model: 'gpt-3.5-turbo',
    });
    res.status(200).json(chatCompletion.choices[0].message);
  }
);
