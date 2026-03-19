import { leaderboard } from "../data/puzzles";

interface Props {
  userScore: number;
  userLevel: number;
}

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ userScore, userLevel }: Props) {
  const userRank = leaderboard.filter((e) => e.score > userScore).length + 1;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>Leaderboard</h2>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Top performers this week</p>

      {/* Your Rank */}
      <div style={{
        background: "rgba(251,191,36,0.08)",
        border: "2px solid rgba(251,191,36,0.25)",
        borderRadius: 14, padding: 16, marginBottom: 20,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(251,191,36,0.15)",
          border: "2px solid #fbbf24",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>You</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Level {userLevel} · {userScore.toLocaleString()} pts
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#64748b" }}>YOUR RANK</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>#{userRank}</div>
        </div>
      </div>

      {/* Top 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {leaderboard.slice(0, 3).map((entry, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.04)",
            border: `2px solid ${i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#b45309"}`,
            borderRadius: 14, padding: "14px 10px", textAlign: "center",
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{medals[i]}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{entry.name}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{entry.score.toLocaleString()}</div>
            <div style={{ fontSize: 10, marginTop: 4, color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#b45309" }}>
              {entry.badge}
            </div>
          </div>
        ))}
      </div>

      {/* Full list */}
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
        FULL RANKINGS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {leaderboard.map((entry, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${i === 0 ? "#fbbf2440" : i === 1 ? "#94a3b840" : i === 2 ? "#b4530940" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 10,
            transition: "transform 0.2s",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: i < 3 ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700,
              color: i < 3 ? "#fbbf24" : "#64748b",
            }}>
              {i < 3 ? medals[i] : entry.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{entry.name}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{entry.badge} · 🔥{entry.streak}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fbbf24" }}>{entry.score.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>pts</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(14,165,233,0.06)", borderRadius: 12, border: "1px solid rgba(14,165,233,0.15)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0ea5e9", marginBottom: 8 }}>📈 How to Climb</div>
        {[
          "Answer questions quickly for time bonuses",
          "Build streaks for +25% point multiplier",
          "Tackle higher difficulty for more points",
          "Enter campaigns for bonus point events",
        ].map((tip, i) => (
          <div key={i} style={{ fontSize: 13, color: "#64748b", marginBottom: 4, display: "flex", gap: 8 }}>
            <span style={{ color: "#0ea5e9" }}>→</span> {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
