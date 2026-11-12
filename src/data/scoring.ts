// Scoring rules. Pure functions used by Convex (the source of truth)
// and by the offline demo backend.

import type { Puzzle } from "./puzzles";

export const ROUND_SIZE = 5;
export const QUESTION_SECONDS = 30;
export const SPEED_POINTS_PER_SECOND = 3;
export const STREAK_THRESHOLD = 3;
export const STREAK_MULTIPLIER = 0.25;
export const MAX_LEVEL = 20;
const POINTS_PER_LEVEL = 250;

export interface ScoreInput {
  puzzle: Puzzle;
  /** Index the player picked, or null if the timer ran out. */
  selected: number | null;
  timeMs: number;
  usedHint: boolean;
  /** Consecutive correct answers before this one. */
  streakBefore: number;
  /** True if the player already got this question right. Repeats are practice only. */
  alreadySolved: boolean;
}

export interface ScoreResult {
  correct: boolean;
  points: number;
  base: number;
  speedBonus: number;
  streakBonus: number;
  practice: boolean;
}

export function scoreAnswer(input: ScoreInput): ScoreResult {
  const { puzzle, selected, usedHint, streakBefore, alreadySolved } = input;
  const correct = selected !== null && selected === puzzle.correct;
  if (!correct || alreadySolved) {
    return { correct, points: 0, base: 0, speedBonus: 0, streakBonus: 0, practice: correct && alreadySolved };
  }
  const timeMs = Math.min(Math.max(input.timeMs, 0), QUESTION_SECONDS * 1000);
  const secondsLeft = Math.floor((QUESTION_SECONDS * 1000 - timeMs) / 1000);
  const base = puzzle.points;
  const speedBonus = usedHint ? 0 : secondsLeft * SPEED_POINTS_PER_SECOND;
  const streakBonus = streakBefore >= STREAK_THRESHOLD ? Math.floor(base * STREAK_MULTIPLIER) : 0;
  return { correct, points: base + speedBonus + streakBonus, base, speedBonus, streakBonus, practice: false };
}

export function levelForScore(score: number) {
  return Math.min(MAX_LEVEL, 1 + Math.floor(score / POINTS_PER_LEVEL));
}

export function levelTitle(level: number) {
  if (level <= 5) return "Apprentice";
  if (level <= 10) return "Technician";
  if (level <= 15) return "Engineer";
  return "Master";
}

/** "Jordan Marsh" -> "Jordan M." so full names never reach other players' screens. */
export function publicName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Player";
  if (parts.length === 1) return parts[0].slice(0, 20);
  return `${parts[0].slice(0, 20)} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/**
 * Picks the next round: unsolved questions first, easiest first,
 * so difficulty climbs as the player clears the board.
 */
export function pickRound(all: Puzzle[], solvedIds: string[]): Puzzle[] {
  const solved = new Set(solvedIds);
  const byLevel = (a: Puzzle, b: Puzzle) => a.level - b.level || a.points - b.points;
  const fresh = all.filter((p) => !solved.has(p.id)).sort(byLevel);
  if (fresh.length >= ROUND_SIZE) return fresh.slice(0, ROUND_SIZE);
  const review = all
    .filter((p) => solved.has(p.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, ROUND_SIZE - fresh.length);
  return [...fresh, ...review];
}
