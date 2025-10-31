import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ ADMIN ROUTERS ============

  admin: router({
    // ---- DASHBOARD ----
    getDashboardStats: adminProcedure.query(async () => {
      const totalClients = await db.getTotalClientCount();
      const onlineAgents = await db.getOnlineAgentsCount();
      const allAgents = await db.getAllAgents();

      return {
        totalClients,
        onlineAgents,
        totalAgents: allAgents.length,
      };
    }),

    // ---- AGENTS ----
    getAllAgents: adminProcedure.query(async () => {
      return await db.getAllAgents();
    }),

    createAgent: adminProcedure
      .input(
        z.object({
          username: z.string().min(3),
          passwordHash: z.string(),
          userId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createAgent(input);
      }),

    updateAgent: adminProcedure
      .input(
        z.object({
          id: z.number(),
          updates: z.object({
            username: z.string().optional(),
            isActive: z.boolean().optional(),
            isOnline: z.boolean().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateAgent(input.id, input.updates);
        return { success: true };
      }),

    deleteAgent: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAgent(input.id);
        return { success: true };
      }),

    // ---- VOYANTS ----
    getAllVoyants: adminProcedure.query(async () => {
      return await db.getAllVoyants();
    }),

    createVoyant: adminProcedure
      .input(
        z.object({
          agentId: z.number(),
          name: z.string(),
          specialty: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          pricePerMinute: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createVoyant({
          agentId: input.agentId,
          name: input.name,
          specialty: input.specialty,
          description: input.description,
          imageUrl: input.imageUrl,
          pricePerMinute: input.pricePerMinute as any,
        });
      }),

    updateVoyant: adminProcedure
      .input(
        z.object({
          id: z.number(),
          updates: z.object({
            name: z.string().optional(),
            specialty: z.string().optional(),
            description: z.string().optional(),
            pricePerMinute: z.string().optional(),
            isActive: z.boolean().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateVoyant(input.id, input.updates as any);
        return { success: true };
      }),

    deleteVoyant: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteVoyant(input.id);
        return { success: true };
      }),

    // ---- CLIENTS ----
    getAllClients: adminProcedure.query(async () => {
      return await db.getAllClients();
    }),

    deleteClient: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteClient(input.id);
        return { success: true };
      }),

    // ---- MINUTE PACKS ----
    grantMinutePack: adminProcedure
      .input(
        z.object({
          clientId: z.number(),
          minutes: z.number(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        return await db.createMinutePack({
          clientId: input.clientId,
          minutes: input.minutes,
          reason: input.reason,
          expiresAt,
        });
      }),

    // ---- REVIEWS ----
    getAllReviews: adminProcedure.query(async () => {
      return await db.getAllReviews();
    }),

    getPendingReviews: adminProcedure.query(async () => {
      return await db.getPendingReviews();
    }),

    createReview: adminProcedure
      .input(
        z.object({
          voyantId: z.number().optional(),
          rating: z.number().min(1).max(5),
          comment: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createReview({
          voyantId: input.voyantId,
          rating: input.rating,
          comment: input.comment,
          isApproved: true,
          isPublished: true,
          createdByAdmin: true,
        });
      }),

    approveReview: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateReview(input.id, { isApproved: true, isPublished: true });
        return { success: true };
      }),

    rejectReview: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteReview(input.id);
        return { success: true };
      }),

    // ---- ANALYTICS ----
    getAnalyticsByDateRange: adminProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ input }) => {
        return await db.getAnalyticsByDateRange(input.startDate, input.endDate);
      }),

    getAgentStats: adminProcedure
      .input(
        z.object({
          agentId: z.number(),
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ input }) => {
        return await db.getAgentStatsByDateRange(input.agentId, input.startDate, input.endDate);
      }),
  }),

  // ============ AGENT ROUTERS ============

  agent: router({
    getMyVoyants: protectedProcedure.query(async () => {
      return await db.getAllVoyants();
    }),

    getMyConversations: protectedProcedure.query(async () => {
      return [];
    }),

    getConversationMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMessagesByConversationId(input.conversationId);
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createMessage({
          conversationId: input.conversationId,
          senderId: ctx.user.id || 0,
          senderType: "agent",
          content: input.content,
        });
      }),

    getMyStats: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ input }) => {
        return [];
      }),
  }),

  // ============ CLIENT ROUTERS ============

  clientData: router({
    registerClient: publicProcedure
      .input(
        z.object({
          username: z.string().min(3),
          passwordHash: z.string().min(8),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createClient({
          userId: 0,
          username: input.username,
          passwordHash: input.passwordHash,
        });
      }),

    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      // Get client profile
      return null;
    }),

    getMyMinutes: protectedProcedure.query(async ({ ctx }) => {
      // Get available minutes for client
      return [];
    }),

    startConversation: protectedProcedure
      .input(
        z.object({
          voyantId: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Start a new conversation
        return null;
      }),

    getActiveConversation: protectedProcedure.query(async ({ ctx }) => {
      // Get current active conversation
      return null;
    }),

    sendClientMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createMessage({
          conversationId: input.conversationId,
          senderId: ctx.user.id || 0,
          senderType: "client",
          content: input.content,
        });
      }),

    endConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateConversation(input.conversationId, { status: "completed" });
        return { success: true };
      }),

    purchaseMinutePack: protectedProcedure
      .input(
        z.object({
          packType: z.enum(["5", "15", "30"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Process payment and add minutes
        return { success: true };
      }),
  }),

  // ============ PUBLIC ROUTERS ============

  public: router({
    getPublishedReviews: publicProcedure.query(async () => {
      return await db.getPublishedReviews();
    }),

    getAllVoyants: publicProcedure.query(async () => {
      return await db.getAllVoyants();
    }),

    getOnlineAgents: publicProcedure.query(async () => {
      return await db.getAllAgents();
    }),
  }),
});

export type AppRouter = typeof appRouter;
