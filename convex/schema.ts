import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Every field added in the redesign is optional, so existing documents stay valid.
export default defineSchema({
  players: defineTable({
    name: v.string(),
    email: v.string(),
    emailLower: v.optional(v.string()),

    // Consent record: what they agreed to and when.
    consentAt: v.optional(v.number()),
    consentVersion: v.optional(v.string()),

    // Attribution: which event and which entry point (qr, nfc, screen, link).
    eventCode: v.optional(v.string()),
    source: v.optional(v.string()),

    // Profile, collected after the first round.
    phone: v.optional(v.string()),
    school: v.optional(v.string()),
    program: v.optional(v.string()),
    gradYear: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
    roleInterest: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    contactOptIn: v.optional(v.boolean()),
    profileBonusAt: v.optional(v.number()),

    // Game state. Only Convex functions write these.
    totalScore: v.number(),
    level: v.number(),
    currentStreak: v.optional(v.number()),
    bestStreak: v.optional(v.number()),
    correctCount: v.optional(v.number()),
    answeredCount: v.optional(v.number()),

    createdAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_score", ["totalScore"])
    .index("by_emailLower", ["emailLower"]),

  quizAttempts: defineTable({
    playerId: v.id("players"),
    puzzleId: v.string(),
    correct: v.boolean(),
    points: v.number(),
    timeMs: v.number(),
    selected: v.optional(v.union(v.number(), v.null())),
    usedHint: v.optional(v.boolean()),
    category: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_player", ["playerId"])
    .index("by_playerId_and_puzzleId", ["playerId", "puzzleId"]),

  resumes: defineTable({
    playerId: v.id("players"),
    storageId: v.id("_storage"),
    filename: v.string(),
    submittedAt: v.number(),
  }).index("by_player", ["playerId"]),

  drawEntries: defineTable({
    playerId: v.id("players"),
    drawId: v.string(),
    code: v.string(),
    createdAt: v.number(),
  })
    .index("by_playerId_and_drawId", ["playerId", "drawId"])
    .index("by_drawId", ["drawId"]),
});
