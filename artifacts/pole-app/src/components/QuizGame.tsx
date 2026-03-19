import { useState, useEffect } from "react";
import { puzzles, difficultyConfig } from "../data/puzzles";

interface Props {
  currentLevel: number;
  totalScore: number;
  onScoreUpdate: (points: number) => void;
  onLevelUp: () => void;
}

type GameState = "menu" | "playing" | "answered";

export default function QuizGame({ currentLevel, onScoreUpdate, onLevelUp }: Props) {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [shuffled] = useState(() => [...puzzles].sort(() => Math.random() - 0.5));
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const currentPuzzle = shuffled[puzzleIdx % shuffled.length];
  const diffConfig = difficultyConfig[currentPuzzle.difficulty];

  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setTimedOut(true);
          setStreak(0);
          setQuestionsAnswered((q) => q + 1);
          setGameState("answered");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, puzzleIdx]);

  function startGame() {
    setSelected(null);
    setShowHint(false);
    setTimedOut(false);
    setTimeLeft(30);
    setGameState("playing");
  }

  function handleAnswer(idx: number) {
    if (gameState !== "playing" || selected !== null) return;
    setSelected(idx);
    setGameState("answered");
    setQuestionsAnswered((q) => q + 1);

    if (idx === currentPuzzle.correct) {
      const timeBonus = Math.floor(timeLeft * 3);
      const streakBonus = streak >= 3 ? Math.floor(currentPuzzle.points * 0.25) : 0;
      const pts = currentPuzzle.points + timeBonus + streakBonus;
      setSessionScore((s) => s + pts);
      onScoreUpdate(pts);
      setStreak((s) => s + 1);
      setCorrectAnswers((c) => {
        if (c + 1 >= 3) onLevelUp();
        return c + 1;
      });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2500);
    } else {
      setStreak(0);
    }
  }

  function nextQuestion() {
    setPuzzleIdx((i) => i + 1);
    setSelected(null);
    setShowHint(false);
    setTimedOut(false);
    setTimeLeft(30);
    setGameState("playing");
  }

  const isCorrect = selected === currentPuzzle.correct;

  if (gameState === "menu") {
    return (
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>Quiz Challenge</h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>
          Test your electrical engineering knowledge. 20 levels of increasing difficulty.
        </p>

        {/* Difficulty Cards */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
            DIFFICULTY LEVELS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.entries(difficultyConfig).map(([key, d]) => (
              <div key={key} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "14px 12px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{d.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{d.label}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Levels {d.levels}</div>
                <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: d.color, opacity: 0.7 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Session stats */}
        {questionsAnswered > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 10 }}>Session Stats</div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {[
                { value: correctAnswers, label: "Correct", color: "#22c55e" },
                { value: questionsAnswered - correctAnswers, label: "Missed", color: "#ef4444" },
                { value: sessionScore.toLocaleString(), label: "Points", color: "#fbbf24" },
                { value: streak, label: "Streak", color: "#a855f7" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={startGame}
          style={{
            background: "#fbbf24", color: "#1a1a1a", border: "none",
            borderRadius: 12, padding: "14px 24px", fontWeight: 700,
            fontSize: 16, cursor: "pointer", width: "100%", marginBottom: 16,
            transition: "all 0.2s",
          }}
        >
          ⚡ Start Quiz
        </button>

        <div style={{ padding: "12px 16px", background: "rgba(14,165,233,0.06)", borderRadius: 10, border: "1px solid rgba(14,165,233,0.15)" }}>
          <div style={{ fontSize: 12, color: "#0ea5e9", fontWeight: 700, marginBottom: 4 }}>SCORING TIPS</div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
            ⏱ Answer quickly for time bonuses (+3pts/sec)<br />
            🔥 Build 3+ streaks for +25% bonus<br />
            💡 Higher difficulty = more points<br />
            📈 3 correct answers = level up!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {confetti && <ConfettiOverlay />}

      {/* Question header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
            {diffConfig.emoji} {diffConfig.label}
          </span>
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: "rgba(14,165,233,0.15)", color: "#0ea5e9" }}>
            {currentPuzzle.category}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Lvl {currentPuzzle.level}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>+{currentPuzzle.points}pts</div>
        </div>
      </div>

      {/* Timer */}
      {gameState === "playing" && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Time</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: timeLeft <= 10 ? "#ef4444" : "#22c55e" }}>
              {timeLeft}s
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, transition: "width 1s linear",
              width: `${(timeLeft / 30) * 100}%`,
              background: timeLeft <= 10 ? "#ef4444" : "linear-gradient(90deg,#fbbf24,#f59e0b)",
            }} />
          </div>
        </div>
      )}

      {/* Streak bonus */}
      {streak >= 3 && (
        <div style={{ marginBottom: 12, padding: "8px 12px", background: "rgba(251,191,36,0.08)", borderRadius: 8, border: "1px solid rgba(251,191,36,0.2)" }}>
          <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13 }}>
            🔥 {streak} STREAK — +25% bonus active!
          </span>
        </div>
      )}

      {/* Question */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.6, margin: 0 }}>
          {currentPuzzle.question}
        </p>
        {showHint && currentPuzzle.hint && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(14,165,233,0.07)", borderRadius: 8, fontSize: 13, color: "#38bdf8" }}>
            💡 Hint: {currentPuzzle.hint}
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {currentPuzzle.options.map((opt, idx) => {
          let borderColor = "rgba(255,255,255,0.1)";
          let bg = "rgba(255,255,255,0.04)";
          if (gameState === "answered") {
            if (idx === currentPuzzle.correct) { borderColor = "#22c55e"; bg = "rgba(34,197,94,0.08)"; }
            else if (idx === selected) { borderColor = "#ef4444"; bg = "rgba(239,68,68,0.08)"; }
          }
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              style={{
                background: bg,
                border: `2px solid ${borderColor}`,
                borderRadius: 12,
                padding: "14px 18px",
                cursor: gameState === "playing" ? "pointer" : "default",
                textAlign: "left",
                fontSize: 14,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.2s",
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#94a3b8",
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Result */}
      {gameState === "answered" && (
        <div>
          <div style={{
            padding: "14px 16px", borderRadius: 12, marginBottom: 14,
            background: timedOut ? "rgba(239,68,68,0.06)" : isCorrect ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
            border: `1px solid ${timedOut ? "#ef4444" : isCorrect ? "#22c55e" : "#ef4444"}`,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: timedOut ? "#ef4444" : isCorrect ? "#22c55e" : "#ef4444" }}>
              {timedOut ? "⏱ Time's up!" : isCorrect ? "✅ Correct!" : "❌ Wrong answer"}
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
              {currentPuzzle.explanation}
            </p>
          </div>
          <button
            onClick={nextQuestion}
            style={{
              background: "#fbbf24", color: "#1a1a1a", border: "none",
              borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 15,
              cursor: "pointer", width: "100%", marginBottom: 10,
            }}
          >
            Next Question →
          </button>
          <button
            onClick={() => setGameState("menu")}
            style={{
              background: "rgba(255,255,255,0.05)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "12px 24px", fontWeight: 600, fontSize: 15,
              cursor: "pointer", width: "100%",
            }}
          >
            Back to Menu
          </button>
        </div>
      )}

      {/* Hint button */}
      {gameState === "playing" && !showHint && currentPuzzle.hint && (
        <button
          onClick={() => setShowHint(true)}
          style={{
            background: "transparent", border: "1px solid rgba(14,165,233,0.2)",
            borderRadius: 8, padding: "8px 14px", color: "#0ea5e9",
            fontSize: 13, cursor: "pointer", width: "100%",
          }}
        >
          💡 Show Hint (no bonus)
        </button>
      )}
    </div>
  );
}

function ConfettiOverlay() {
  const pieces = Array.from({ length: 18 }).map((_, i) => ({
    x: Math.random() * 100,
    color: ["#fbbf24", "#22c55e", "#0ea5e9", "#a855f7", "#ef4444"][i % 5],
    delay: Math.random() * 0.8,
    size: Math.random() * 8 + 6,
  }));

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 1000, overflow: "hidden" }}>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute", left: `${p.x}%`, top: 0,
            width: p.size, height: p.size,
            background: p.color,
            borderRadius: i % 2 === 0 ? "50%" : "2px",
            animation: `confettiFall ${2 + p.delay}s ease-in forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`@keyframes confettiFall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
}
