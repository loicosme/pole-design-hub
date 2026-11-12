// Offline stand-in for "convex/react", swapped in by Vite when VITE_DEMO=1
// (npm run demo). Everything lives in this browser's localStorage, so the
// app can be designed, demoed and screenshotted with no backend.
//
// It mirrors the functions in /convex. Convex is the source of truth:
// if you change a function there, mirror the change here.

import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { getFunctionName, type FunctionReference } from "convex/server";
import { DRAW, PROFILE_BONUS, RESUME_UNLOCK_THRESHOLD } from "../branding";
import { puzzleById } from "../data/puzzles";
import { levelForScore, publicName, scoreAnswer } from "../data/scoring";

type Row = Record<string, any>;
interface Db {
  players: Row[];
  attempts: Row[];
  resumes: Row[];
  entries: Row[];
}

const KEY = "pgc_demo_db";
const DEMO_ADMIN_KEY = "demo";

function seed(): Db {
  const mk = (name: string, school: string, totalScore: number): Row => ({
    _id: `seed-${name}`,
    name,
    email: `${name.split(" ")[0].toLowerCase()}@example.edu`,
    school,
    program: "Electrical",
    gradYear: "2027",
    lookingFor: "Co-op or internship",
    totalScore,
    level: levelForScore(totalScore),
    correctCount: Math.round(totalScore / 220),
    answeredCount: Math.round(totalScore / 180),
    createdAt: Date.now() - 3600_000,
    contactOptIn: true,
    consentVersion: "demo",
    eventCode: "demo-event",
    source: "qr",
  });
  return {
    players: [
      mk("Priya Nair", "University of Saskatchewan", 2140),
      mk("Dylan Kowalchuk", "Saskatchewan Polytechnic", 1685),
      mk("Mei Tanaka", "University of Regina", 1320),
      mk("Owen Bear", "University of Saskatchewan", 905),
      mk("Sara Haddad", "University of Alberta", 610),
      mk("Lucas Friesen", "Saskatchewan Polytechnic", 340),
    ],
    attempts: [],
    resumes: [],
    entries: [],
  };
}

let db: Db = (() => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* fall through to a fresh seed */
  }
  return seed();
})();

let version = 0;
const listeners = new Set<() => void>();
function commit() {
  version++;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable: keep it in memory */
  }
  listeners.forEach((l) => l());
}

const player = (id: string) => db.players.find((p) => p._id === id);
const complete = (p: Row) => Boolean(p.school && p.program && p.gradYear && p.lookingFor);
const fail = (message: string) => Object.assign(new Error(message), { data: message });

const handlers: Record<string, (args: any) => any> = {
  "players:register": (a) => {
    const emailLower = String(a.email).trim().toLowerCase();
    if (!a.name.trim()) throw fail("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) throw fail("Enter a valid email address.");
    if (!a.consent) throw fail("Consent is required to play.");
    const existing = db.players.find((p) => p.emailLower === emailLower);
    if (existing) return existing._id;
    const _id = `p-${Date.now().toString(36)}`;
    db.players.push({
      _id,
      name: a.name.trim(),
      email: a.email.trim(),
      emailLower,
      consentAt: Date.now(),
      consentVersion: a.consentVersion,
      eventCode: a.eventCode,
      source: a.source,
      totalScore: 0,
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      createdAt: Date.now(),
    });
    commit();
    return _id;
  },
  "players:me": ({ id }) => {
    const p = player(id);
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
      profileComplete: complete(p),
      profileBonusClaimed: p.profileBonusAt !== undefined,
      followUpAnswered: p.contactOptIn !== undefined,
      contactOptIn: p.contactOptIn ?? false,
    };
  },
  "players:updateProfile": ({ id, ...fields }) => {
    const p = player(id);
    if (!p) throw fail("Player not found.");
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v === "string" && v.trim()) p[k] = v.trim();
      if (typeof v === "boolean") p[k] = v;
    }
    let bonus = 0;
    if (p.profileBonusAt === undefined && complete(p)) {
      bonus = PROFILE_BONUS;
      p.profileBonusAt = Date.now();
      p.totalScore += bonus;
      p.level = levelForScore(p.totalScore);
    }
    commit();
    return { bonus };
  },
  "attempts:submit": (a) => {
    const p = player(a.playerId);
    const puzzle = puzzleById[a.puzzleId];
    if (!p || !puzzle) throw fail("Unknown question.");
    const alreadySolved = db.attempts.some(
      (t) => t.playerId === a.playerId && t.puzzleId === a.puzzleId && t.correct,
    );
    const result = scoreAnswer({
      puzzle,
      selected: a.selected,
      timeMs: a.timeMs,
      usedHint: a.usedHint,
      streakBefore: p.currentStreak ?? 0,
      alreadySolved,
    });
    db.attempts.push({ ...a, correct: result.correct, points: result.points, createdAt: Date.now() });
    p.currentStreak = result.correct ? (p.currentStreak ?? 0) + 1 : 0;
    p.bestStreak = Math.max(p.bestStreak ?? 0, p.currentStreak);
    p.correctCount = (p.correctCount ?? 0) + (result.correct ? 1 : 0);
    p.answeredCount = (p.answeredCount ?? 0) + 1;
    p.totalScore += result.points;
    p.level = levelForScore(p.totalScore);
    commit();
    return { ...result, totalScore: p.totalScore, currentStreak: p.currentStreak };
  },
  "attempts:solved": ({ playerId }) => [
    ...new Set(db.attempts.filter((t) => t.playerId === playerId && t.correct).map((t) => t.puzzleId)),
  ],
  "leaderboard:top": ({ playerId, limit }) =>
    [...db.players]
      .sort((a, b) => b.totalScore - a.totalScore)
      .filter((p) => p.totalScore > 0)
      .slice(0, limit ?? 20)
      .map((p, i) => ({
        rank: i + 1,
        name: publicName(p.name),
        school: p.school ?? "",
        totalScore: p.totalScore,
        level: p.level,
        isMe: p._id === playerId,
      })),
  "leaderboard:rank": ({ playerId }) => {
    const p = player(playerId);
    if (!p) return null;
    return { rank: db.players.filter((o) => o.totalScore > p.totalScore).length + 1, capped: false };
  },
  "draw:enter": ({ playerId }) => {
    const p = player(playerId);
    if (!p || p.totalScore < RESUME_UNLOCK_THRESHOLD) throw fail(`Reach ${RESUME_UNLOCK_THRESHOLD} points to enter.`);
    let entry = db.entries.find((e) => e.playerId === playerId);
    if (!entry) {
      entry = { playerId, drawId: DRAW.id, code: Math.random().toString(36).slice(2, 8).toUpperCase() };
      db.entries.push(entry);
      commit();
    }
    return { code: entry.code };
  },
  "draw:mine": ({ playerId }) => {
    const entry = db.entries.find((e) => e.playerId === playerId);
    return entry ? { code: entry.code } : null;
  },
  "resumes:generateUploadUrl": () => "demo:upload",
  "resumes:submit": ({ playerId, filename }) => {
    db.resumes = db.resumes.filter((r) => r.playerId !== playerId);
    db.resumes.push({ playerId, filename, submittedAt: Date.now() });
    commit();
    return null;
  },
  "resumes:getByPlayer": ({ playerId }) => {
    const r = db.resumes.find((x) => x.playerId === playerId);
    return r ? { filename: r.filename, submittedAt: r.submittedAt } : null;
  },
  "admin:leads": ({ key }) => {
    if (key !== DEMO_ADMIN_KEY) return { ok: false };
    return {
      ok: true,
      capped: false,
      rows: [...db.players]
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((p) => {
          const resume = db.resumes.find((r) => r.playerId === p._id);
          return {
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
            resumeUrl: null,
            drawCode: db.entries.find((e) => e.playerId === p._id)?.code ?? "",
            eventCode: p.eventCode ?? "",
            source: p.source ?? "",
            consentVersion: p.consentVersion ?? "",
            consentAt: p.consentAt ?? null,
            createdAt: p.createdAt,
          };
        }),
    };
  },
};

function run(ref: FunctionReference<any>, args: unknown) {
  const name = getFunctionName(ref);
  const handler = handlers[name];
  if (!handler) throw new Error(`Demo backend has no handler for ${name}`);
  return handler(args ?? {});
}

export class ConvexReactClient {
  constructor(_url?: string) {}
}

export function ConvexProvider({ children }: { client: ConvexReactClient; children: ReactNode }) {
  return <>{children}</>;
}

export function useQuery(ref: FunctionReference<"query">, args?: unknown): any {
  const v = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
  );
  const key = JSON.stringify(args ?? {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (args === "skip" ? undefined : run(ref, args)), [v, key]);
}

export function useMutation(ref: FunctionReference<"mutation">): any {
  return useCallback(async (args?: unknown) => run(ref, args), [ref]);
}
