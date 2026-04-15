import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Props {
  userScore: number;
  userLevel: number;
  playerId: Id<"players">;
}

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ userScore, userLevel, playerId }: Props) {
  const entries = useQuery(api.leaderboard.top) ?? [];
  const userRank = entries.filter((e) => e.totalScore > userScore).length + 1;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>Leaderboard</h2>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Top performers — updates live</p>

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

      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b", fontSize: 14 }}>
          No scores yet — be the first! 🏆
        </div>
      ) : (
        <>
          {/* Top 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {entries.slice(0, 3).map((entry, i) => (
              <div key={entry._id} style={{
                background: "rgba(255,255,255,0.04)",
                border: `2px solid ${i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#b45309"}`,
                borderRadius: 14, padding: "14px 10px", textAlign: "center",
              }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{medals[i]}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{entry.totalScore.toLocaleString()}</div>
                <div style={{ fontSize: 10, marginTop: 4, color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#b45309" }}>
                  {entry.school}
                </div>
              </div>
            ))}
          </div>

          {/* Full list */}
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
            FULL RANKINGS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map((entry, i) => (
              <div key={entry._id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                background: entry._id === playerId ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${i === 0 ? "#fbbf2440" : i === 1 ? "#94a3b840" : i === 2 ? "#b4530940" : entry._id === playerId ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: i < 3 ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700,
                  color: i < 3 ? "#fbbf24" : "#64748b",
                  flexShrink: 0,
                }}>
                  {i < 3 ? medals[i] : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.name} {entry._id === playerId ? "(you)" : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{entry.school} · Lv {entry.level}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fbbf24" }}>{entry.totalScore.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>pts</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(14,165,233,0.06)", borderRadius: 12, border: "1px solid rgba(14,165,233,0.15)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0ea5e9", marginBottom: 8 }}>📈 How to Climb</div>
        {[
          "Answer questions quickly for time bonuses",
          "Build streaks for +25% point multiplier",
          "Tackle higher difficulty for more points",
          "Hit 500 pts to unlock resume submission",
        ].map((tip, i) => (
          <div key={i} style={{ fontSize: 13, color: "#64748b", marginBottom: 4, display: "flex", gap: 8 }}>
            <span style={{ color: "#0ea5e9" }}>→</span> {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
