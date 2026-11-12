import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { DRAW, RESUME_UNLOCK_THRESHOLD } from "../src/branding";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Enters the prize draw once. Calling it again returns the same code. */
export const enter = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    if (!DRAW.enabled) throw new ConvexError("There is no draw running.");
    const player = await ctx.db.get(playerId);
    if (!player) throw new ConvexError("Player not found.");
    if (player.totalScore < RESUME_UNLOCK_THRESHOLD) {
      throw new ConvexError(`Reach ${RESUME_UNLOCK_THRESHOLD} points to enter.`);
    }
    const existing = await ctx.db
      .query("drawEntries")
      .withIndex("by_playerId_and_drawId", (q) => q.eq("playerId", playerId).eq("drawId", DRAW.id))
      .first();
    if (existing) return { code: existing.code };

    let code = "";
    for (let i = 0; i < 6; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    await ctx.db.insert("drawEntries", { playerId, drawId: DRAW.id, code, createdAt: Date.now() });
    return { code };
  },
});

export const mine = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    const entry = await ctx.db
      .query("drawEntries")
      .withIndex("by_playerId_and_drawId", (q) => q.eq("playerId", playerId).eq("drawId", DRAW.id))
      .first();
    return entry ? { code: entry.code } : null;
  },
});
