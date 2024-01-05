import {
  User,
  Message,
  Chat,
  Friends,
  NewFriendsType,
  NewMessageType,
  NewUserType,
  NewAiChat,
  AiChat,
  NewAiMessage,
  AiMessage,
} from './schema';
import { eq, and, relations, or, desc } from 'drizzle-orm';
import { db } from './db';

export const getUserByUsername = async (username: string) => {
  const result = await db
    .select({
      id: User.id,
      username: User.username,
      email: User.email,
      firstName: User.first_name,
      lastName: User.last_name,
      profile_photo: User.profile_photo,
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

export const checkFriendship = async (myId: number, friendId: number) => {
  const result = await db.query.Friends.findFirst({
    where: or(
      and(
        eq(Friends.user_id1, myId),
        eq(Friends.user_id2, friendId),
        eq(Friends.status, 'accepted')
      ),
      and(
        eq(Friends.user_id1, friendId),
        eq(Friends.user_id2, myId),
        eq(Friends.status, 'accepted')
      ),
      and(
        eq(Friends.user_id1, myId),
        eq(Friends.user_id2, friendId),
        eq(Friends.status, 'pending')
      ),
      and(
        eq(Friends.user_id1, friendId),
        eq(Friends.user_id2, myId),
        eq(Friends.status, 'pending')
      )
    ),
    with: {
      friend: true,
    },
  });
  return result;
};

export const getFriendsList = async (id: string) => {
  const idNumber = Number(id);
  const result = await db.query.Friends.findMany({
    where: or(
      and(eq(Friends.user_id1, idNumber), eq(Friends.status, 'accepted')),
      and(eq(Friends.user_id2, idNumber), eq(Friends.status, 'accepted'))
    ),
    with: {
      friend: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
      user: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
    },
  });
  return result;
};

export const getFriendRequests = async (id: string) => {
  const idNumber = Number(id);
  const result = await db.query.Friends.findMany({
    where: and(eq(Friends.user_id2, idNumber), eq(Friends.status, 'pending')),
    with: {
      friend: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
      user: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
    },
  });
  return result;
};

export const addFriend = async (newFriend: NewFriendsType) => {
  const result = await db.insert(Friends).values(newFriend).returning();
  return result;
};

export const acceptFriend = async (myId: number, friendId: number) => {
  const newFriend = await db
    .update(Friends)
    .set({ status: 'accepted' })
    .where(
      or(
        and(eq(Friends.user_id1, myId), eq(Friends.user_id2, friendId)),
        and(eq(Friends.user_id1, friendId), eq(Friends.user_id2, myId))
      )
    )
    .returning();

  return newFriend;
};

export const deleteFriend = async (myId: number, friendId: number) => {
  const deletedFriendId = await db
    .delete(Friends)
    .where(
      or(
        and(eq(Friends.user_id1, myId), eq(Friends.user_id2, friendId)),
        and(eq(Friends.user_id1, friendId), eq(Friends.user_id2, myId))
      )
    )
    .returning();
  return deletedFriendId;
};

export const getChats = async (myId: number) => {
  const chats = await db.query.Chat.findMany({
    where: or(eq(Chat.user_id1, myId), eq(Chat.user_id2, myId)),
    with: {
      message: {
        orderBy: [desc(Message.timestamp)],
      },
      user1: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
      user2: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
    },
  });
  return chats;
};

export const getChat = async (chatId: string) => {
  const chat = await db.query.Chat.findFirst({
    where: eq(Chat.chatId, chatId),
    with: {
      message: {
        orderBy: [desc(Message.timestamp)],
      },
      user1: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
      user2: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
    },
  });
  return chat;
};

export const getChatById = async (chatId: number) => {
  const chat = await db.query.Chat.findFirst({
    where: eq(Chat.id, chatId),
    with: {
      message: {
        orderBy: [desc(Message.timestamp)],
      },
      user1: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
      user2: {
        columns: {
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          username: true,
          profile_photo: true,
        },
      },
    },
  });
  return chat;
};

export const createChat = async (myId: number, friendId: number) => {
  const result = await db
    .insert(Chat)
    .values({
      user_id1: myId,
      user_id2: friendId,
      chatId: `${myId}--${friendId}`,
    })
    .returning();
  return result;
};

export const deleteChat = async (myId: number, friendId: number) => {
  const result = await db
    .delete(Chat)
    .where(and(eq(Chat.user_id1, myId), eq(Chat.user_id2, friendId)))
    .returning();
  return result;
};

export const createMessage = async (newMessage: NewMessageType) => {
  const message = await db.insert(Message).values(newMessage).returning();
  return message;
};

export const createAiChat = async () => {
  const chat = await db.insert(AiChat).values({}).returning();
  return chat;
};

export const createAiMessage = async (newAiMessage: NewAiMessage) => {
  const aiMessage = await db.insert(AiMessage).values(newAiMessage).returning();
  return aiMessage;
};

export const getAiChat = async (id: number) => {
  const chat = await db.query.AiChat.findFirst({
    where: eq(AiChat.id, id),
    with: {
      aiMessage: {
        columns: {
          role: true,
          content: true,
        },
      },
    },
  });
  return chat;
};
