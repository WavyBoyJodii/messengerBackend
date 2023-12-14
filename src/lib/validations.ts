import { body } from 'express-validator';

export const register = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .escape()
    .withMessage('username must be atleast 3 characters long'),
  body('password')
    .trim()
    .isLength({ min: 7 })
    .escape()
    .withMessage('password must be atleast 7 characters long'),
  body('email')
    .trim()
    .isEmail()
    .escape()
    .withMessage('must supply valid email'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('must input First Name'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('must input Last Name'),
  body('photo').trim().escape(),
];
