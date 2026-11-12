import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { RESUME_UNLOCK_THRESHOLD } from "../branding";
import { difficultyConfig, puzzles, type Puzzle } from "../data/puzzles";
import { QUESTION_SECONDS, ROUND_SIZE, STREAK_THRESHOLD, pickRound } from "../data/scoring";
import { errorMessage } from "../lib/session";
import { STEP_COPY, StepBody, useNextStep, type Me } from "./Capture";
import { Button, Confetti, Notice, PoleTag, Sheet, cx } from "./ui";

type Phase = "idle" | "question" | "feedback" | "summary";

interface Result {
  correct: boolean;
  points: number;
  base: number;
  speedBonus: number;
  streakBonus: number;
  practice: boolean;
}

export default function Play({
  playerId,
  me,
  onShowBoard,
}: {
  playerId: Id<"players">;
  me: Me;
  onShowBoard: () => void;
}) {
  const solved = useQuery(api.attempts.solved, { playerId });
  const rank = useQuery(api.leaderboard.rank, { playerId });
  const submit = useMutation(api.attempts.submit);
  const nextStep = useNextStep(playerId, me);

  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<Puzzle[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [roundPoints, setRoundPoints] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [msLeft, setMsLeft] = useState(QUESTION_SECONDS * 1000);
  const startedAt = useRef(0);
  const answering = useRef(false);

  const puzzle = round[idx];
  const solvedCount = solved?.length ?? 0;
  const boardCleared = solved !== undefined && solvedCount >= puzzles.length;

  function startRound() {
    setRound(pickRound(puzzles, solved ?? []));
    setIdx(0);
    setRoundPoints(0);
    setRoundCorrect(0);
    beginQuestion();
  }

  function beginQuestion() {
    setSelected(null);
    setTimedOut(false);
    setUsedHint(false);
    setResult(null);
    setError("");
    setMsLeft(QUESTION_SECONDS * 1000);
    startedAt.current = Date.now();
    answering.current = false;
    setPhase("question");
    window.scrollTo({ top: 0 });
  }

  async function answer(choice: number | null) {
    if (answering.current || !puzzle) return;
    answering.current = true;
    const timeMs = Date.now() - startedAt.current;
    setSelected(choice);
    setTimedOut(choice === null);
    setPhase("feedback");
    try {
      const r: Result = await submit({ playerId, puzzleId: puzzle.id, selected: choice, timeMs, usedHint });
      setResult(r);
      setRoundPoints((p) => p + r.points);
      if (r.correct) setRoundCorrect((c) => c + 1);
    } catch (err) {
      setError(errorMessage(err, "That answer wasn't saved. Check your connection."));
    }
  }

  useEffect(() => {
    if (phase !== "question") return;
    const timer = setInterval(() => {
      const left = QUESTION_SECONDS * 1000 - (Date.now() - startedAt.current);
      setMsLeft(Math.max(0, left));
      if (left <= 0) void answer(null);
    }, 200);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // ── Start screen ────────────────────────────────────────────────────────
  if (phase === "idle") {
    const toUnlock = Math.max(0, RESUME_UNLOCK_THRESHOLD - me.totalScore);
    return (
      <div className="space-y-4">
        <header>
          <h1 className="font-display text-[34px] font-bold leading-none">
            {me.answeredCount === 0 ? `Ready, ${me.name.split(" ")[0]}?` : "Next round"}
          </h1>
          <p className="mt-1 text-ink-soft">
            {boardCleared
              ? "You've answered every question correctly. Replays are for practice and don't add points."
              : `${ROUND_SIZE} questions, ${QUESTION_SECONDS} seconds each. Faster answers score more.`}
          </p>
        </header>

        <Button onClick={startRound} disabled={solved === undefined} className="min-h-14 text-[20px]">
          ⚡ {me.answeredCount === 0 ? "Start round 1" : boardCleared ? "Play a practice round" : "Start the next round"}
        </Button>

        <Sheet>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[20px] font-semibold">
              {toUnlock > 0 ? `🔒 ${toUnlock} points to résumé drop-off` : "📄 Résumé drop-off is open"}
            </h2>
            <span className="tabular text-[14px] text-ink-soft">
              {Math.min(me.totalScore, RESUME_UNLOCK_THRESHOLD)} / {RESUME_UNLOCK_THRESHOLD}
            </span>
          </div>
          <div
            className="mt-2 h-3 overflow-hidden rounded-sm border-2 border-edge bg-sheet"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={RESUME_UNLOCK_THRESHOLD}
            aria-valuenow={Math.min(me.totalScore, RESUME_UNLOCK_THRESHOLD)}
          >
            <div
              className="h-full bg-hazard"
              style={{ width: `${Math.min(100, (me.totalScore / RESUME_UNLOCK_THRESHOLD) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[15px] text-ink-soft">
            {solvedCount} of {puzzles.length} questions solved
            {me.bestStreak >= 2 ? `, best streak ${me.bestStreak}` : ""}.
          </p>
        </Sheet>

        {nextStep && me.answeredCount > 0 && (
          <Sheet className="border-l-[10px] border-l-hazard">
            <h2 className="font-display text-[22px] font-semibold leading-tight">{STEP_COPY[nextStep].title}</h2>
            <p className="mb-3 mt-1 text-[15px] text-ink-soft">{STEP_COPY[nextStep].body}</p>
            <StepBody step={nextStep} playerId={playerId} me={me} />
          </Sheet>
        )}

        <Sheet>
          <h2 className="font-display text-[20px] font-semibold text-volt">Scoring tips</h2>
          <ul className="mt-1.5 space-y-1 text-[15px] text-ink-soft">
            <li>📈 100 to 750 for a correct answer, more for harder questions.</li>
            <li>⏱ 3 extra for every second left on the clock.</li>
            <li>🔥 25% extra once you have {STREAK_THRESHOLD} right in a row.</li>
            <li>💡 Using a hint gives up the time bonus for that question.</li>
          </ul>
        </Sheet>
      </div>
    );
  }

  // ── Round summary ───────────────────────────────────────────────────────
  if (phase === "summary") {
    return (
      <div className="space-y-4">
        <header className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[34px] font-bold leading-none">
              <span className="pop">{roundCorrect >= 3 ? "🎉" : "💪"}</span> Round done
            </h1>
            <p className="mt-1 text-ink-soft">
              {roundCorrect} of {round.length} correct
              {rank ? `. You're number ${rank.rank}${rank.capped ? "+" : ""} on the board.` : "."}
            </p>
          </div>
          <PoleTag value={`+${roundPoints.toLocaleString()}`} label="this round" tone="hazard" size="lg" />
        </header>

        {nextStep && (
          <Sheet className="rise border-l-[10px] border-l-hazard">
            <h2 className="font-display text-[22px] font-semibold leading-tight">{STEP_COPY[nextStep].title}</h2>
            <p className="mb-3 mt-1 text-[15px] text-ink-soft">{STEP_COPY[nextStep].body}</p>
            <StepBody step={nextStep} playerId={playerId} me={me} />
          </Sheet>
        )}

        <Button variant={nextStep ? "secondary" : "primary"} onClick={startRound}>
          Play another round
        </Button>
        <Button variant="secondary" onClick={onShowBoard}>
          See the board
        </Button>
      </div>
    );
  }

  // ── Question and feedback ───────────────────────────────────────────────
  const secondsLeft = Math.ceil(msLeft / 1000);
  const low = secondsLeft <= 10;
  const last = idx === round.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[15px]">
        <span className="font-semibold">
          Question {idx + 1} of {round.length}
        </span>
        <span className="text-ink-soft">
          {difficultyConfig[puzzle.difficulty].label}, {puzzle.category.toLowerCase()}, {puzzle.points} pts
        </span>
      </div>

      <div className="flex items-center gap-3" aria-hidden={phase !== "question"}>
        <div className="h-3 flex-1 overflow-hidden rounded-sm border-2 border-edge bg-sheet">
          <div
            className={cx("h-full transition-[width] duration-200 ease-linear", low ? "bg-stop" : "bg-hazard")}
            style={{ width: `${phase === "question" ? (msLeft / (QUESTION_SECONDS * 1000)) * 100 : 0}%` }}
          />
        </div>
        <span className={cx("font-display tabular w-9 text-right text-[24px] font-bold", low && "text-stop")}>
          {phase === "question" ? secondsLeft : "0"}
        </span>
      </div>

      {me.currentStreak >= STREAK_THRESHOLD && phase === "question" && (
        <p className="text-[15px] font-semibold">
          🔥 {me.currentStreak} in a row. The 25% streak bonus is on.
        </p>
      )}

      <h1 className="text-[21px] font-semibold leading-snug">{puzzle.question}</h1>

      {usedHint && puzzle.hint && <Notice tone="info">💡 Hint: {puzzle.hint}</Notice>}

      <ol className="space-y-2.5">
        {puzzle.options.map((opt, i) => {
          const isCorrect = i === puzzle.correct;
          const isPicked = i === selected;
          const revealed = phase === "feedback";
          return (
            <li key={i}>
              <button
                disabled={revealed}
                onClick={() => answer(i)}
                className={cx(
                  "flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left text-[17px]",
                  !revealed && "border-edge bg-sheet active:bg-hazard/20",
                  revealed && isCorrect && "border-glass bg-glass-tint font-semibold",
                  revealed && isPicked && !isCorrect && "border-stop bg-stop-tint",
                  revealed && !isCorrect && !isPicked && "border-line bg-sheet text-ink-soft",
                )}
              >
                <span
                  className={cx(
                    "font-display flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-[18px] font-bold",
                    revealed && isCorrect ? "border-glass bg-glass text-night" : "border-current",
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && isCorrect && <span className="text-[18px]">✅</span>}
                {revealed && isPicked && !isCorrect && (
                  <span className="text-[18px]">❌</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {phase === "question" && puzzle.hint && !usedHint && (
        <Button variant="quiet" onClick={() => setUsedHint(true)}>
          💡 Show a hint (gives up the time bonus)
        </Button>
      )}

      {phase === "feedback" && (
        <div className="rise space-y-3" aria-live="polite">
          {result?.correct && <Confetti />}
          <Sheet className={cx("border-l-[10px]", selected === puzzle.correct ? "border-l-glass" : "border-l-stop")}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-[26px] font-bold leading-tight">
                <span className="pop">{timedOut ? "⏱" : selected === puzzle.correct ? "✅" : "❌"}</span>{" "}
                {timedOut ? "Time's up!" : selected === puzzle.correct ? "Correct!" : "Not quite"}
              </h2>
              {result && result.points > 0 && (
                <PoleTag value={`+${result.points}`} label="points" tone="hazard" />
              )}
            </div>
            {result && result.points > 0 && (
              <p className="tabular mt-1 text-[14px] text-ink-soft">
                {result.base} base
                {result.speedBonus > 0 && `, ${result.speedBonus} speed`}
                {result.streakBonus > 0 && `, ${result.streakBonus} streak`}
              </p>
            )}
            {result?.practice && (
              <p className="mt-1 text-[14px] text-ink-soft">You'd already solved this one, so no points this time.</p>
            )}
            <p className="mt-2">{puzzle.explanation}</p>
          </Sheet>
          {error && <Notice tone="bad">{error}</Notice>}
          <Button
            onClick={() => {
              if (last) {
                setPhase("summary");
                window.scrollTo({ top: 0 });
              } else {
                setIdx((n) => n + 1);
                beginQuestion();
              }
            }}
          >
            {last ? "See round results →" : "Next question →"}
          </Button>
        </div>
      )}
    </div>
  );
}
