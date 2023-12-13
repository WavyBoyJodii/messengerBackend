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
import { sql, relations } from 'drizzle-orm';

export const friendStatusEnum = pgEnum('status', [
  'pending',
  'accepted',
  'rejected',
]);
export const user = pgTable(
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

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const userRelations = relations(user, ({ many }) => ({
  message: many(message),
  chat: many(chat),
}));

export const message = pgTable('message', {
  id: serial('id').primaryKey(),
  body: varchar('body', { length: 2500 }).notNull(),
  timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`),
  user_id: integer('user_id')
    .notNull()
    .references(() => user.id),
  chat_id: integer('chat_id')
    .notNull()
    .references(() => chat.id),
});

export type Message = typeof message.$inferSelect;
export type NewMessage = typeof message.$inferInsert;

export const messageRelations = relations(message, ({ one }) => ({
  user: one(user, {
    fields: [message.user_id],
    references: [user.id],
  }),
  chat: one(chat, {
    fields: [message.chat_id],
    references: [chat.id],
  }),
}));

export const Friends = pgTable(
  'friends',
  {
    user_id1: integer('user_id1').references(() => user.id),
    user_id2: integer('user_id2').references(() => user.id),
    status: friendStatusEnum('status'),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.user_id1, table.user_id2] }),
    };
  }
);

export const chat = pgTable('chat', {
  id: serial('id').primaryKey(),
  user_id1: integer('user_id1').references(() => user.id),
  user_id2: integer('user_id2').references(() => user.id),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const chatRelations = relations(chat, ({ one, many }) => ({
  message: many(message),
  user1: one(user, {
    fields: [chat.user_id1],
    references: [user.id],
  }),
  user2: one(user, {
    fields: [chat.user_id2],
    references: [user.id],
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
