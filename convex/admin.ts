import { query } from "./_generated/server";
import { v } from "convex/values";
import { DRAW } from "../src/branding";

const MAX_LEADS = 500;

/**
 * Recruiter export. Protected by a shared passcode stored in the Convex
 * environment variable ADMIN_KEY (npx convex env set ADMIN_KEY "...").
 * With no key set, nothing is returned.
 *
 * This is booth-grade protection. Put real auth in front of it
 * before the data set gets large or long-lived.
 */
export const leads = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const expected = process.env.ADMIN_KEY;
    if (!expected || key !== expected) return { ok: false as const };

    const players = await ctx.db.query("players").withIndex("by_score").order("desc").take(MAX_LEADS);
    const rows = [];
    for (const p of players) {
      const resume = await ctx.db
        .query("resumes")
        .withIndex("by_player", (q) => q.eq("playerId", p._id))
        .first();
      const entry = await ctx.db
        .query("drawEntries")
        .withIndex("by_playerId_and_drawId", (q) => q.eq("playerId", p._id).eq("drawId", DRAW.id))
        .first();
      rows.push({
        name: p.name,
        email: p.email,
        phone: p.phone ?? "",
        school: p.school ?? "",
        program: p.program ?? "",
        gradYear: p.gradYear ?? "",
        lookingFor: p.lookingFor ?? "",
        roleInterest: p.roleInterest ?? "",
        linkedin: p.linkedin ?? "",
        contactOptIn: p.contactOptIn ?? null,
        totalScore: p.totalScore,
        level: p.level,
        correctCount: p.correctCount ?? 0,
        answeredCount: p.answeredCount ?? 0,
        bestStreak: p.bestStreak ?? 0,
        resumeFilename: resume?.filename ?? "",
        resumeUrl: resume ? await ctx.storage.getUrl(resume.storageId) : null,
        drawCode: entry?.code ?? "",
        eventCode: p.eventCode ?? "",
        source: p.source ?? "",
        consentVersion: p.consentVersion ?? "",
        consentAt: p.consentAt ?? null,
        createdAt: p.createdAt,
      });
    }
    return { ok: true as const, rows, capped: players.length === MAX_LEADS };
  },
});
