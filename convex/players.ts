import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { PROFILE_BONUS } from "../src/branding";
import { levelForScore } from "../src/data/scoring";
import type { Doc } from "./_generated/dataModel";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: string | undefined, max = 120) {
  if (value === undefined) return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed === "" ? undefined : trimmed;
}

function profileComplete(p: Pick<Doc<"players">, "school" | "program" | "gradYear" | "lookingFor">) {
  return Boolean(p.school && p.program && p.gradYear && p.lookingFor);
}

/**
 * Sign up with the minimum: name, email, consent.
 * If the email is already registered the existing player is returned,
 * so one person is one lead no matter how many times they scan the code.
 */
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    consent: v.boolean(),
    consentVersion: v.string(),
    eventCode: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = clean(args.name, 80);
    const email = clean(args.email, 200);
    if (!name) throw new ConvexError("Enter your name.");
    if (!email || !EMAIL_RE.test(email)) throw new ConvexError("Enter a valid email address.");
    if (!args.consent) throw new ConvexError("Consent is required to play.");

    const emailLower = email.toLowerCase();
    const now = Date.now();
    const existing = await ctx.db
      .query("players")
      .withIndex("by_emailLower", (q) => q.eq("emailLower", emailLower))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { lastActiveAt: now });
      return existing._id;
    }

    return await ctx.db.insert("players", {
      name,
      email,
      emailLower,
      consentAt: now,
      consentVersion: args.consentVersion,
      eventCode: clean(args.eventCode, 60),
      source: clean(args.source, 30),
      totalScore: 0,
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      createdAt: now,
      lastActiveAt: now,
    });
  },
});

/**
 * What the player's own device needs. Deliberately leaves out email,
 * phone and LinkedIn so they never travel back to a browser.
 */
export const me = query({
  args: { id: v.id("players") },
  handler: async (ctx, { id }) => {
    const p = await ctx.db.get(id);
    if (!p) return null;
    return {
      name: p.name,
      totalScore: p.totalScore,
      level: p.level,
      currentStreak: p.currentStreak ?? 0,
      bestStreak: p.bestStreak ?? 0,
      correctCount: p.correctCount ?? 0,
      answeredCount: p.answeredCount ?? 0,
      school: p.school ?? "",
      program: p.program ?? "",
      gradYear: p.gradYear ?? "",
      lookingFor: p.lookingFor ?? "",
      roleInterest: p.roleInterest ?? "",
      profileComplete: profileComplete(p),
      profileBonusClaimed: p.profileBonusAt !== undefined,
      followUpAnswered: p.contactOptIn !== undefined,
      contactOptIn: p.contactOptIn ?? false,
    };
  },
});

/**
 * Progressive profile. Only the fields passed are changed.
 * Completing school, program, grad year and "looking for" pays a one-time bonus.
 */
export const updateProfile = mutation({
  args: {
    id: v.id("players"),
    school: v.optional(v.string()),
    program: v.optional(v.string()),
    gradYear: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
    roleInterest: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    phone: v.optional(v.string()),
    contactOptIn: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, contactOptIn, ...fields }) => {
    const player = await ctx.db.get(id);
    if (!player) throw new ConvexError("Player not found.");

    const patch: Partial<Doc<"players">> = { lastActiveAt: Date.now() };
    for (const key of ["school", "program", "gradYear", "lookingFor", "roleInterest", "phone"] as const) {
      const value = clean(fields[key]);
      if (value !== undefined) patch[key] = value;
    }
    const linkedin = clean(fields.linkedin, 200);
    if (linkedin !== undefined) patch.linkedin = linkedin;
    if (contactOptIn !== undefined) patch.contactOptIn = contactOptIn;

    let bonus = 0;
    if (player.profileBonusAt === undefined && profileComplete({ ...player, ...patch })) {
      bonus = PROFILE_BONUS;
      patch.profileBonusAt = Date.now();
      patch.totalScore = player.totalScore + bonus;
      patch.level = levelForScore(player.totalScore + bonus);
    }
    await ctx.db.patch(id, patch);
    return { bonus };
  },
});
