import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { relations } from 'drizzle-orm';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || process.cwd();
const sqlite = new Database(path.join(DATA_DIR, './data/db.sqlite'));

// Define relations between tables
export const usersRelations = relations(schema.users, ({ many }) => ({
  chats: many(schema.chats),
  messages: many(schema.messages),
  sessions: many(schema.sessions),
  configs: many(schema.userConfigs),
}));

export const chatsRelations = relations(schema.chats, ({ one, many }) => ({
  user: one(schema.users, {
    fields: [schema.chats.userId],
    references: [schema.users.id],
  }),
  messages: many(schema.messages),
}));

export const messagesRelations = relations(schema.messages, ({ one }) => ({
  user: one(schema.users, {
    fields: [schema.messages.userId],
    references: [schema.users.id],
  }),
  chat: one(schema.chats, {
    fields: [schema.messages.chatId],
    references: [schema.chats.id],
  }),
}));

export const sessionsRelations = relations(schema.sessions, ({ one }) => ({
  user: one(schema.users, {
    fields: [schema.sessions.userId],
    references: [schema.users.id],
  }),
}));

export const userConfigsRelations = relations(
  schema.userConfigs,
  ({ one }) => ({
    user: one(schema.users, {
      fields: [schema.userConfigs.userId],
      references: [schema.users.id],
    }),
  }),
);

const db = drizzle(sqlite, {
  schema: {
    ...schema,
    usersRelations,
    chatsRelations,
    messagesRelations,
    sessionsRelations,
    userConfigsRelations,
  },
});

export default db;
export { db };
