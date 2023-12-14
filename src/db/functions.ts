import {
  User,
  Message,
  Chat,
  Friends,
  NewFriendsType,
  NewMessageType,
  NewUserType,
} from './schema';
import { eq, and } from 'drizzle-orm';
import { db } from './db';

export const getUserByUsername = async (username: string) => {
  const result = await db
    .select({
      id: User.id,
      username: User.username,
      email: User.email,
      firstName: User.first_name,
      lastName: User.last_name,
    })
    .from(User)
    .where(eq(User.username, username));
  if (result.length === 0) return null;
  const user = result[0];
  return user;
};
export const getUserById = async (id: number) => {
  const result = await db.select().from(User).where(eq(User.id, id));
  if (result.length === 0) return null;
  const user = result[0];
  return user;
};

export const createUser = async (newUser: NewUserType) => {
  const result = await db.insert(User).values(newUser).returning();
  return result;
};

export const getFriendsList = async (id: string) => {
  const idNumber = Number(id);
  const result = await db.query.Friends.findMany({
    where: and(eq(Friends.user_id1, idNumber), eq(Friends.status, 'accepted')),
    with: {
      friend: true,
    },
  });
  return result;
};

export const addFriend = async (newFriend: NewFriendsType) => {
  const result = await db.insert(Friends).values(newFriend).returning();
  return result;
};
