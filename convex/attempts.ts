import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const record = mutation({
  args: {
    playerId: v.id("players"),
    puzzleId: v.string(),
    correct: v.boolean(),
    points: v.number(),
    timeMs: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("quizAttempts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
