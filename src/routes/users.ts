import express from 'express';
import * as userController from '../controllers/userController';
import { verifyJwtToken } from '../middleware/verifyJwt';
import { acceptRequest, friendRequest } from '../lib/validations';
import { validateCheck } from '../middleware/validateCheck';
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/friendslist/:id', verifyJwtToken, userController.findFriends);

router.get(
  '/friend/request',
  verifyJwtToken,
  userController.viewFriendRequests
);

router.put(
  '/friend/request',
  acceptRequest,
  validateCheck,
  verifyJwtToken,
  userController.acceptFriendRequest
);

router.post(
  '/friend/request',
  friendRequest,
  validateCheck,
  verifyJwtToken,
  userController.sendFriendRequest
);

export default router;
