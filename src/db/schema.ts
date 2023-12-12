import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  primaryKey,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const friendStatusEnum = pgEnum('status', [
  'pending',
  'accepted',
  'rejected',
]);
export const User = pgTable(
  'user',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 50 }).unique().notNull(),
    password: varchar('password', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).unique().notNull(),
    first_name: varchar('first_name', { length: 100 }).notNull(),
    last_name: varchar('last_name', { length: 100 }).notNull(),
    profile_photo: text('profile_photo'),
  },
  (table) => {
    return {
      idxUsername: uniqueIndex('idx_username').on(table.username),
    };
  }
);

export const Message = pgTable('message', {
  id: serial('id').primaryKey(),
  body: varchar('body', { length: 2500 }).notNull(),
  timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`),
  user_id: integer('user_id').references(() => User.id),
  chat_id: integer('chat_id').references(() => Chat.id),
});

export const Friend = pgTable(
  'friend',
  {
    user_id1: integer('user_id1').references(() => User.id),
    user_id2: integer('user_id2').references(() => User.id),
    status: friendStatusEnum('status'),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.user_id1, table.user_id2] }),
    };
  }
);

export const Chat = pgTable('chat', {
  id: serial('id').primaryKey(),
  user_id1: integer('user_id1').references(() => User.id),
  user_id2: integer('user_id2').references(() => User.id),
});
