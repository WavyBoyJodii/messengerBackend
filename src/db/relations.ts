import { relations } from 'drizzle-orm';
import { User, Message, Chat, Friends } from './schema';

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
