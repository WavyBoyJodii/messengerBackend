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
import { sql, relations, eq } from 'drizzle-orm';
import { db } from './db';

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

export const userRelations = relations(User, ({ many }) => ({
  message: many(Message),
  chat: many(Chat),
}));

export const Message = pgTable('message', {
  id: serial('id').primaryKey(),
  body: varchar('body', { length: 2500 }).notNull(),
  timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`),
  user_id: integer('user_id')
    .notNull()
    .references(() => User.id),
  chat_id: integer('chat_id')
    .notNull()
    .references(() => Chat.id),
});

export type MessageType = typeof Message.$inferSelect;
export type NewMessageType = typeof Message.$inferInsert;

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

export const Friends = pgTable(
  'friends',
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
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

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
export const createUser = async (newUser: NewUserType) => {
  const result = await db.insert(User).values(newUser).returning();
  return result;
};
