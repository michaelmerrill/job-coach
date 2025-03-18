import { asc, eq } from "drizzle-orm";
import { db } from "./drizzle";
import { chat, message, Message } from "./schema";

export async function saveChat({ id, userId }: { id: string; userId: string }) {
  try {
    return db.insert(chat).values({
      id,
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat to the database.", error);
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [result] = await db.select().from(chat).where(eq(chat.id, id));
    return result;
  } catch (error) {
    console.error("Failed to get chat by id from database.", error);
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(asc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user id", error);
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Omit<Message, "createdAt">[];
}) {
  try {
    return db.insert(message).values(messages).returning();
  } catch (error) {
    console.error("Failed to save messages to the database.", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error("Failed to get messages by chat id.", error);
    throw error;
  }
}
