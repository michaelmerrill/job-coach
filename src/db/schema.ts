import { InferSelectModel } from "drizzle-orm";
import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export type Chat = InferSelectModel<typeof chat>;

export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Message = InferSelectModel<typeof message>;

export const message = pgTable("message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  parts: json("parts").notNull(),
  role: varchar("role").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
