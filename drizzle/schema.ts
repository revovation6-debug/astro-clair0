import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for admin, agent, and client roles.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "agent", "client"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Agents table - Accounts for voyance agents
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0").notNull(),
  totalMinutesServed: int("totalMinutesServed").default(0).notNull(),
  totalClients: int("totalClients").default(0).notNull(),
  isOnline: boolean("isOnline").default(false).notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Voyants table - Profiles of voyants assigned to agents
 */
export const voyants = mysqlTable("voyants", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  specialty: varchar("specialty", { length: 200 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  pricePerMinute: decimal("pricePerMinute", { precision: 6, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00").notNull(),
  totalReviews: int("totalReviews").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Voyant = typeof voyants.$inferSelect;
export type InsertVoyant = typeof voyants.$inferInsert;

/**
 * Clients table - Customer accounts
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  totalMinutesAvailable: int("totalMinutesAvailable").default(0).notNull(),
  totalMinutesUsed: int("totalMinutesUsed").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Minute Packs table - Free minutes attribution to loyal clients
 */
export const minutePacks = mysqlTable("minutePacks", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  minutes: int("minutes").notNull(),
  reason: text("reason"),
  expiresAt: timestamp("expiresAt"),
  isUsed: boolean("isUsed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MinutePack = typeof minutePacks.$inferSelect;
export type InsertMinutePack = typeof minutePacks.$inferInsert;

/**
 * Reviews/Avis table - Reviews created by admin or submitted by clients
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  voyantId: int("voyantId"),
  clientId: int("clientId"),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment").notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdByAdmin: boolean("createdByAdmin").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Conversations table - Chat history between clients and agents
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  voyantId: int("voyantId").notNull(),
  agentId: int("agentId").notNull(),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  minutesUsed: int("minutesUsed").default(0).notNull(),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }).default("0").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table - Individual messages in conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(), // Can be client or agent
  senderType: mysqlEnum("senderType", ["client", "agent"]).notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Analytics table - Track website visits and usage
 */
export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  date: datetime("date").notNull(),
  pageViews: int("pageViews").default(0).notNull(),
  uniqueVisitors: int("uniqueVisitors").default(0).notNull(),
  newClients: int("newClients").default(0).notNull(),
  totalConversations: int("totalConversations").default(0).notNull(),
  totalMinutesServed: int("totalMinutesServed").default(0).notNull(),
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

/**
 * Agent Statistics table - Track productivity and earnings per agent
 */
export const agentStats = mysqlTable("agentStats", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  date: datetime("date").notNull(),
  minutesServed: int("minutesServed").default(0).notNull(),
  clientsServed: int("clientsServed").default(0).notNull(),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).default("0").notNull(),
  conversationCount: int("conversationCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentStats = typeof agentStats.$inferSelect;
export type InsertAgentStats = typeof agentStats.$inferInsert;
