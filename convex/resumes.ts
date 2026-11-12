import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { RESUME_UNLOCK_THRESHOLD } from "../src/branding";

export const generateUploadUrl = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    const player = await ctx.db.get(playerId);
    if (!player || player.totalScore < RESUME_UNLOCK_THRESHOLD) {
      throw new ConvexError(`Reach ${RESUME_UNLOCK_THRESHOLD} points to send a résumé.`);
    }
    return await ctx.storage.generateUploadUrl();
  },
});

/** Saves the résumé. A newer upload replaces the older one. */
export const submit = mutation({
  args: {
    playerId: v.id("players"),
    storageId: v.id("_storage"),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player || player.totalScore < RESUME_UNLOCK_THRESHOLD) {
      throw new ConvexError(`Reach ${RESUME_UNLOCK_THRESHOLD} points to send a résumé.`);
    }
    const existing = await ctx.db
      .query("resumes")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();
    if (existing) {
      await ctx.storage.delete(existing.storageId);
      await ctx.db.delete(existing._id);
    }
    await ctx.db.insert("resumes", {
      playerId: args.playerId,
      storageId: args.storageId,
      filename: args.filename.slice(0, 200),
      submittedAt: Date.now(),
    });
    return null;
  },
});

export const getByPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    const resume = await ctx.db
      .query("resumes")
      .withIndex("by_player", (q) => q.eq("playerId", playerId))
      .first();
    return resume ? { filename: resume.filename, submittedAt: resume.submittedAt } : null;
  },
});
