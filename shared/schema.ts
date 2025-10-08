import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Media item from Google Drive
export const mediaItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  thumbnailLink: z.string().optional(),
  webContentLink: z.string().optional(),
  webViewLink: z.string().optional(),
  modifiedTime: z.string().optional(),
  size: z.string().optional(),
  isVideo: z.boolean(),
  isImage: z.boolean(),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

// Liked media stored in localStorage
export const likedMediaSchema = z.object({
  id: z.string(),
  likedAt: z.string(),
});

export type LikedMedia = z.infer<typeof likedMediaSchema>;
