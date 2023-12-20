import express from 'express';
import * as userController from '../controllers/userController';
import { verifyJwtToken } from '../middleware/verifyJwt';
import { acceptRequest, friendRequest, messageVal } from '../lib/validations';
import { validateCheck } from '../middleware/validateCheck';
const router = express.Router();

/* GET users listing. */
router.get('/verify', verifyJwtToken, function (req, res, next) {
  res.status(200).send(true);
});

// GET friends list for user in params
router.get('/friendslist/:id', verifyJwtToken, userController.findFriends);

// GET friend requests for logged in user
router.get(
  '/friend/request',
  verifyJwtToken,
  userController.viewFriendRequests
);

// ACCEPT friend request for logged in user
router.put(
  '/friend/request',
  acceptRequest,
  validateCheck,
  verifyJwtToken,
  userController.acceptFriendRequest
);

// DELETE friend of logged in user
router.delete(
  '/friend/request',
  acceptRequest,
  validateCheck,
  verifyJwtToken,
  userController.removeFriend
);

// POST method to send friend request by logged in user
router.post(
  '/friend/request',
  friendRequest,
  validateCheck,
  verifyJwtToken,
  userController.sendFriendRequest
);

// GET all chats for logged in user
router.get('/chats', verifyJwtToken, userController.viewMyChats);

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
export default router;
