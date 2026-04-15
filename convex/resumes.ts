import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { RESUME_UNLOCK_THRESHOLD } from "./constants";

export const generateUploadUrl = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    const player = await ctx.db.get(playerId);
    if (!player || player.totalScore < RESUME_UNLOCK_THRESHOLD) {
      throw new Error("Score threshold not met");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const submit = mutation({
  args: {
    playerId: v.id("players"),
    storageId: v.id("_storage"),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player || player.totalScore < RESUME_UNLOCK_THRESHOLD) {
      throw new Error("Score threshold not met");
    }
    await ctx.db.insert("resumes", {
      ...args,
      submittedAt: Date.now(),
    });
  },
});

export const getByPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    return await ctx.db
      .query("resumes")
      .withIndex("by_player", (q) => q.eq("playerId", playerId))
      .first();
  },
});
