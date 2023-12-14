import express from 'express';
import * as userController from '../controllers/userController';
import { verifyJwtToken } from 'middleware/verifyJwt';
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/friendslist/:id', verifyJwtToken, userController.findFriends);

export default router;
