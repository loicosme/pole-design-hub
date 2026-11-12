import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { puzzleById } from "../src/data/puzzles";
import { levelForScore, scoreAnswer } from "../src/data/scoring";

/**
 * Records one answer and scores it on the server.
 * The browser never tells us how many points to award, and a question
 * that was already answered correctly earns nothing the second time.
 */
export const submit = mutation({
  args: {
    playerId: v.id("players"),
    puzzleId: v.string(),
    selected: v.union(v.number(), v.null()),
    timeMs: v.number(),
    usedHint: v.boolean(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new ConvexError("Player not found.");
    const puzzle = puzzleById[args.puzzleId];
    if (!puzzle) throw new ConvexError("Unknown question.");

    const earlier = await ctx.db
      .query("quizAttempts")
      .withIndex("by_playerId_and_puzzleId", (q) => q.eq("playerId", args.playerId).eq("puzzleId", args.puzzleId))
      .take(50);
    const alreadySolved = earlier.some((a) => a.correct);

    const streakBefore = player.currentStreak ?? 0;
    const result = scoreAnswer({
      puzzle,
      selected: args.selected,
      timeMs: args.timeMs,
      usedHint: args.usedHint,
      streakBefore,
      alreadySolved,
    });

    const now = Date.now();
    await ctx.db.insert("quizAttempts", {
      playerId: args.playerId,
      puzzleId: args.puzzleId,
      correct: result.correct,
      points: result.points,
      timeMs: Math.max(0, Math.round(args.timeMs)),
      selected: args.selected,
      usedHint: args.usedHint,
      category: puzzle.category,
      createdAt: now,
    });

    const currentStreak = result.correct ? streakBefore + 1 : 0;
    const totalScore = player.totalScore + result.points;
    await ctx.db.patch(args.playerId, {
      totalScore,
      level: levelForScore(totalScore),
      currentStreak,
      bestStreak: Math.max(player.bestStreak ?? 0, currentStreak),
      correctCount: (player.correctCount ?? 0) + (result.correct ? 1 : 0),
      answeredCount: (player.answeredCount ?? 0) + 1,
      lastActiveAt: now,
    });

    return { ...result, totalScore, currentStreak };
  },
});

/** Ids of the questions this player has already answered correctly. */
export const solved = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_player", (q) => q.eq("playerId", playerId))
      .take(1000);
    return [...new Set(attempts.filter((a) => a.correct).map((a) => a.puzzleId))];
  },
});
