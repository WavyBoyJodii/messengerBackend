import express from 'express';
import * as userController from '../controllers/userController';
import { verifyJwtToken } from '../middleware/verifyJwt';
import {
  acceptRequest,
  aiValidator,
  friendRequest,
  messageVal,
} from '../lib/validations';
import { validateCheck } from '../middleware/validateCheck';
const router = express.Router();

/* GET users listing. */
router.get('/verify', verifyJwtToken, function (req, res, next) {
  res.status(200).send(true);
});

// Get Me returns current user for logged in user
router.get('/me', verifyJwtToken, userController.provideUser);

// Post method to search user by username
router.get(
  '/findbyusername/:username',
  verifyJwtToken,
  userController.searchUserByUsername
);

// Get Find method to search for users in DB by id
router.get('/find/:id', verifyJwtToken, userController.searchUser);

// GET friends list for user in params
router.get('/friendslist/:id', verifyJwtToken, userController.findFriends);

// GET friend requests for logged in user
router.get('/friend/:id', verifyJwtToken, userController.viewFriendRequests);

// ACCEPT friend request for logged in user
router.put(
  '/friend/',
  acceptRequest,
  validateCheck,
  verifyJwtToken,
  userController.acceptFriendRequest
);

// DELETE friend of logged in user
router.delete('/friend/:id', verifyJwtToken, userController.removeFriend);

// POST method to send friend request by logged in user
router.post(
  '/friend/request',
  friendRequest,
  validateCheck,
  verifyJwtToken,
  userController.sendFriendRequest
);

// GET all chats for logged in user
router.get('/chats/:id', verifyJwtToken, userController.viewMyChats);

// Create new chat for logged in user
router.post(
  '/chat',
  acceptRequest,
  validateCheck,
  verifyJwtToken,
  userController.newChat
);

// DELETE chat for logged in user
router.delete(
  '/chat/:id',
  acceptRequest,
  validateCheck,
  verifyJwtToken,
  userController.deleteMyChat
);

// GET single chat between user and friend
router.get('/chat/:id', verifyJwtToken, userController.getMyChat);

// Post route for user sending a message
router.post(
  '/message',
  messageVal,
  validateCheck,
  verifyJwtToken,
  userController.sendMessage
);

// GET route for creating a new Ai Chat
router.get('/ai/new', verifyJwtToken, userController.createNewAiChat);

// POST route for creating a new message in ai Chat and sending message to openAi
router.post('/ai', verifyJwtToken, userController.aiChat);
export default router;
