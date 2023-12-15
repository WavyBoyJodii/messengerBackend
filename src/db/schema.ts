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
import { sql, eq, and, relations } from 'drizzle-orm';
// import { db } from './db';

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

export type UserType = typeof User.$inferSelect;
export type NewUserType = typeof User.$inferInsert;

export const Chat = pgTable('chat', {
  id: serial('id').primaryKey(),
  user_id1: integer('user_id1')
    .notNull()
    .references(() => User.id),
  user_id2: integer('user_id2')
    .notNull()
    .references(() => User.id),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export type NewChat = typeof Chat.$inferInsert;

export const Message = pgTable('message', {
  id: serial('id').primaryKey(),
  body: varchar('body', { length: 2500 }).notNull(),
  timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`),
  user_id: integer('user_id')
    .notNull()
    .references(() => User.id),
  chat_id: integer('chat_id')
    .notNull()
    .references(() => Chat.id, { onDelete: 'cascade' }),
});

export type MessageType = typeof Message.$inferSelect;
export type NewMessageType = typeof Message.$inferInsert;

export const Friends = pgTable(
  'friends',
  {
    user_id1: integer('user_id1')
      .notNull()
      .references(() => User.id),
    user_id2: integer('user_id2')
      .notNull()
      .references(() => User.id),
    status: friendStatusEnum('status').notNull().default('pending'),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.user_id1, table.user_id2] }),
    };
  }
);
export type NewFriendsType = typeof Friends.$inferInsert;

// export const UserChat = pgTable(
//   'user_chat',
//   {
//     user_id: integer('user_id').references(() => User.id),
//     chat_id: integer('chat_id').references(() => Chat.id),
//   },
//   (table) => {
//     return {
//       pk: primaryKey({ columns: [table.chat_id, table.user_id] }),
//     };
//   }
// );

export const userRelations = relations(User, ({ many }) => ({
  message: many(Message),
  chat: many(Chat),
  friends: many(Friends),
}));

export const messageRelations = relations(Message, ({ one }) => ({
  user: one(User, {
    fields: [Message.user_id],
    references: [User.id],
  }),
  chat: one(Chat, {
    fields: [Message.chat_id],
    references: [Chat.id],
  }),
}));

export const friendRelations = relations(Friends, ({ one }) => ({
  user: one(User, {
    fields: [Friends.user_id1],
    references: [User.id],
  }),
  friend: one(User, {
    fields: [Friends.user_id2],
    references: [User.id],
  }),
}));

export const chatRelations = relations(Chat, ({ one, many }) => ({
  message: many(Message),
  user1: one(User, {
    fields: [Chat.user_id1],
    references: [User.id],
  }),
  user2: one(User, {
    fields: [Chat.user_id2],
    references: [User.id],
  }),
}));