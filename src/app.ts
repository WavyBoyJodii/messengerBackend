import createError, { HttpError } from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import passportLocal from 'passport-local';
import flash from 'connect-flash';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import { db } from './db/db';
import { user } from './db/schema';
import { eq } from 'drizzle-orm';
import indexRouter from './routes/index';
import usersRouter from './routes/users';
const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../', 'views'));
app.set('view engine', 'pug');

const LocalStrategy = passportLocal.Strategy;
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const result = await db
        .select()
        .from(user)
        .where(eq(user.username, username));
      if (result.length === 0) {
        return done(null, false, { message: 'Incorrect username' });
      }
      const match = await bcrypt.compare(password, result[0].password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, result[0]);
    } catch (err) {
      return done(err);
    }
  })
);

app.use(cors());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ["'self'", 'code.jquery.com', 'cdn.jsdelivr.net'],
    },
  })
);
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
