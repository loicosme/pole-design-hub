import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    school: v.optional(v.string()),
    gradYear: v.optional(v.string()),
    roleInterest: v.optional(v.string()),
    totalScore: v.number(),
    level: v.number(),
    createdAt: v.number(),
  }).index("by_score", ["totalScore"]),

  quizAttempts: defineTable({
    playerId: v.id("players"),
    puzzleId: v.string(),
    correct: v.boolean(),
    points: v.number(),
    timeMs: v.number(),
    createdAt: v.number(),
  }).index("by_player", ["playerId"]),

  resumes: defineTable({
    playerId: v.id("players"),
    storageId: v.id("_storage"),
    filename: v.string(),
    submittedAt: v.number(),
  }).index("by_player", ["playerId"]),
});
