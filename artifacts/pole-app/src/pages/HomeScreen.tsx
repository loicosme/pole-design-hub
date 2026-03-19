import { useState } from "react";
import PoleExplorer from "../components/PoleExplorer";
import QuizGame from "../components/QuizGame";
import Leaderboard from "../components/Leaderboard";
import CampaignPanel from "../components/CampaignPanel";

type Tab = "explore" | "quiz" | "leaderboard" | "campaign";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("explore");
  const [totalScore, setTotalScore] = useState(0);
  const [level, setLevel] = useState(1);

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "explore", label: "Explore", emoji: "🔍" },
    { id: "quiz", label: "Quiz", emoji: "⚡" },
    { id: "leaderboard", label: "Ranks", emoji: "🏆" },
    { id: "campaign", label: "Win", emoji: "🎁" },
  ];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0a0f1e" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#fbbf24", fontWeight: 700, marginBottom: 6 }}>
          ⚡ UTILITY POLE ENGINEERING ⚡
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.2, color: "#fff" }}>
          Power Grid Challenge
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0", lineHeight: 1.4 }}>
          Learn. Solve. Win. Master the grid.
        </p>

        {/* Score Bar */}
        <div style={{
          marginTop: 16,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              borderRadius: "50%",
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "bold", fontSize: 14, color: "#1a1a1a",
            }}>{level}</div>
            <div>
              <div style={{ fontSize: 11, color: "#64748b" }}>YOUR LEVEL</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>
                {level <= 5 ? "Apprentice" : level <= 10 ? "Technician" : level <= 15 ? "Engineer" : "Master"}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#64748b" }}>TOTAL SCORE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
              {totalScore.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: 4,
        padding: "14px 20px 0",
        margin: "14px 20px 0",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, textAlign: "center", padding: "8px 4px 12px",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              borderRadius: 8, border: "none",
              background: activeTab === tab.id ? "#fbbf24" : "transparent",
              color: activeTab === tab.id ? "#1a1a1a" : "#64748b",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 18 }}>{tab.emoji}</div>
            <div style={{ marginTop: 2 }}>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 20px 100px" }}>
        {activeTab === "explore" && <PoleExplorer />}
        {activeTab === "quiz" && (
          <QuizGame
            currentLevel={level}
            totalScore={totalScore}
            onScoreUpdate={(pts) => setTotalScore((s) => s + pts)}
            onLevelUp={() => setLevel((l) => Math.min(l + 1, 20))}
          />
        )}
        {activeTab === "leaderboard" && <Leaderboard userScore={totalScore} userLevel={level} />}
        {activeTab === "campaign" && <CampaignPanel totalScore={totalScore} level={level} />}
      </div>
    </div>
  );
}
