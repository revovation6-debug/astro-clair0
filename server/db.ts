import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  agents,
  voyants,
  clients,
  minutePacks,
  reviews,
  conversations,
  messages,
  analytics,
  agentStats,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ AGENTS ============

export async function createAgent(agentData: {
  userId: number;
  username: string;
  passwordHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agents).values(agentData);
  return result;
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(agents).orderBy(desc(agents.createdAt));
}

export async function updateAgent(id: number, updates: Partial<typeof agents.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(agents).set(updates).where(eq(agents.id, id));
}

export async function deleteAgent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(agents).where(eq(agents.id, id));
}

// ============ VOYANTS ============

export async function createVoyant(voyantData: typeof voyants.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(voyants).values(voyantData);
  return result;
}

export async function getVoyantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(voyants).where(eq(voyants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getVoyantsByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(voyants).where(eq(voyants.agentId, agentId));
}

export async function getAllVoyants() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(voyants).orderBy(desc(voyants.createdAt));
}

export async function updateVoyant(id: number, updates: Partial<typeof voyants.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(voyants).set(updates).where(eq(voyants.id, id));
}

export async function deleteVoyant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(voyants).where(eq(voyants.id, id));
}

// ============ CLIENTS ============

export async function createClient(clientData: typeof clients.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(clients).values(clientData);
  return result;
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function updateClient(id: number, updates: Partial<typeof clients.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clients).set(updates).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(clients).where(eq(clients.id, id));
}

// ============ MINUTE PACKS ============

export async function createMinutePack(packData: typeof minutePacks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(minutePacks).values(packData);
  return result;
}

export async function getMinutePacksByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(minutePacks)
    .where(and(eq(minutePacks.clientId, clientId), eq(minutePacks.isUsed, false)))
    .orderBy(desc(minutePacks.createdAt));
}

export async function updateMinutePack(id: number, updates: Partial<typeof minutePacks.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(minutePacks).set(updates).where(eq(minutePacks.id, id));
}

// ============ REVIEWS ============

export async function createReview(reviewData: typeof reviews.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(reviewData);
  return result;
}

export async function getReviewById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPublishedReviews() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.isPublished, true), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt));
}

export async function getPendingReviews() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.isApproved, false), eq(reviews.createdByAdmin, false)))
    .orderBy(desc(reviews.createdAt));
}

export async function getAllReviews() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function updateReview(id: number, updates: Partial<typeof reviews.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reviews).set(updates).where(eq(reviews.id, id));
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(reviews).where(eq(reviews.id, id));
}

// ============ ANALYTICS ============

export async function getAnalyticsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(analytics)
    .where(and(gte(analytics.date, startDate), lte(analytics.date, endDate)))
    .orderBy(desc(analytics.date));
}

export async function getTodayAnalytics() {
  const db = await getDb();
  if (!db) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db
    .select()
    .from(analytics)
    .where(and(gte(analytics.date, today), lte(analytics.date, tomorrow)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateAnalytics(date: Date, updates: Partial<typeof analytics.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  await db
    .update(analytics)
    .set(updates)
    .where(and(gte(analytics.date, dateStart), lte(analytics.date, dateEnd)));
}

// ============ AGENT STATS ============

export async function getAgentStatsByDateRange(agentId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(agentStats)
    .where(
      and(
        eq(agentStats.agentId, agentId),
        gte(agentStats.date, startDate),
        lte(agentStats.date, endDate)
      )
    )
    .orderBy(desc(agentStats.date));
}

export async function createAgentStats(statsData: typeof agentStats.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentStats).values(statsData);
  return result;
}

// ============ CONVERSATIONS ============

export async function createConversation(conversationData: typeof conversations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(conversations).values(conversationData);
  return result;
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getConversationsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.clientId, clientId))
    .orderBy(desc(conversations.createdAt));
}

export async function updateConversation(
  id: number,
  updates: Partial<typeof conversations.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(conversations).set(updates).where(eq(conversations.id, id));
}

// ============ MESSAGES ============

export async function createMessage(messageData: typeof messages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(messageData);
  return result;
}

export async function getMessagesByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt));
}

// ============ STATISTICS ============

export async function getClientCountByDate(date: Date) {
  const db = await getDb();
  if (!db) return 0;

  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clients)
    .where(and(gte(clients.createdAt, dateStart), lte(clients.createdAt, dateEnd)));

  return result[0]?.count || 0;
}

export async function getTotalClientCount() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clients)
    .where(eq(clients.isActive, true));

  return result[0]?.count || 0;
}

export async function getOnlineAgentsCount() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(agents)
    .where(and(eq(agents.isOnline, true), eq(agents.isActive, true)));

  return result[0]?.count || 0;
}
