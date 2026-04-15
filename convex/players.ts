import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    school: v.optional(v.string()),
    gradYear: v.optional(v.string()),
    roleInterest: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("players", {
      ...args,
      totalScore: 0,
      level: 1,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getById = query({
  args: { id: v.id("players") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const updateScore = mutation({
  args: {
    id: v.id("players"),
    addPoints: v.number(),
    newLevel: v.number(),
  },
  handler: async (ctx, { id, addPoints, newLevel }) => {
    const player = await ctx.db.get(id);
    if (!player) return;
    await ctx.db.patch(id, {
      totalScore: player.totalScore + addPoints,
      level: newLevel,
    });
  },
});
