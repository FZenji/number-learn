import { pgTable, text, integer, timestamp, serial, uniqueIndex } from 'drizzle-orm/pg-core';

// Users table — synced from Clerk via webhook
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Custom numbers created by users
export const customNumbers = pgTable('custom_numbers', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  externalId: text('external_id').notNull(), // client-generated UUID
  name: text('name').notNull(),
  digits: text('digits').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('custom_numbers_clerk_external_idx').on(table.clerkId, table.externalId),
]);

// Progress per number per user
export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  numberId: text('number_id').notNull(), // built-in ID like 'pi' or custom number externalId
  digitsLearned: integer('digits_learned').default(0).notNull(),
  bestAccuracy: integer('best_accuracy').default(0).notNull(), // 0-100
  currentStreak: integer('current_streak').default(0).notNull(),
  bestStreak: integer('best_streak').default(0).notNull(),
  lastPracticeDate: text('last_practice_date'), // ISO date string
  totalPracticeTime: integer('total_practice_time').default(0).notNull(), // seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('progress_clerk_number_idx').on(table.clerkId, table.numberId),
]);
