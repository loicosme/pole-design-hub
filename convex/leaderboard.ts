import { query } from "./_generated/server";
import { v } from "convex/values";
import { publicName } from "../src/data/scoring";

/**
 * Top players, safe to show on any screen: first name and last initial only.
 * No emails, no ids. A player id works like a password in this app,
 * so it must never be sent to other people's browsers.
 */
export const top = query({
  args: { playerId: v.optional(v.id("players")), limit: v.optional(v.number()) },
  handler: async (ctx, { playerId, limit }) => {
    const rows = await ctx.db
      .query("players")
      .withIndex("by_score")
      .order("desc")
      .take(Math.min(Math.max(limit ?? 20, 1), 50));
    return rows
      .filter((p) => p.totalScore > 0)
      .map((p, i) => ({
        rank: i + 1,
        name: publicName(p.name),
        school: p.school ?? "",
        totalScore: p.totalScore,
        level: p.level,
        isMe: playerId !== undefined && p._id === playerId,
      }));
  },
});

/** The caller's rank among everyone, capped so the read stays bounded. */
export const rank = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    const player = await ctx.db.get(playerId);
    if (!player) return null;
    const CAP = 500;
    const ahead = await ctx.db
      .query("players")
      .withIndex("by_score", (q) => q.gt("totalScore", player.totalScore))
      .take(CAP);
    return { rank: ahead.length + 1, capped: ahead.length === CAP };
  },
});
