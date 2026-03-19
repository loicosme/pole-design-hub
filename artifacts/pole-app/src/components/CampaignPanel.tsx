import { useState } from "react";
import { campaigns } from "../data/puzzles";

interface Props {
  totalScore: number;
  level: number;
}

export default function CampaignPanel({ totalScore }: Props) {
  const [entered, setEntered] = useState<string[]>([]);
  const [showEntryFor, setShowEntryFor] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [latestCode, setLatestCode] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  function handleSubmit(campaignId: string) {
    if (!name.trim() || !email.trim()) return;
    const code = `PWR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setLatestCode(code);
    setEntered((prev) => [...prev, campaignId]);
    setJustSubmitted(true);
    setShowEntryFor(null);
    setName("");
    setEmail("");
    setTimeout(() => setJustSubmitted(false), 6000);
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>Win Prizes</h2>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>
        Complete challenges, enter to win real prizes.
      </p>

      {/* Score requirement */}
      {totalScore < 500 && (
        <div style={{
          padding: "14px 16px", marginBottom: 20,
          background: "rgba(251,191,36,0.06)",
          border: "1px solid rgba(251,191,36,0.18)",
          borderRadius: 12, display: "flex", gap: 12, alignItems: "center",
        }}>
          <span style={{ fontSize: 28 }}>🔒</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>Unlock Campaigns</div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
              Earn 500 points to enter prize campaigns.<br />
              You have <strong style={{ color: "#fff" }}>{totalScore}</strong> pts — keep quizzing!
            </div>
            <div style={{ marginTop: 8, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 3, background: "#fbbf24", width: `${Math.min((totalScore / 500) * 100, 100)}%`, transition: "width 0.5s" }} />
            </div>
          </div>
        </div>
      )}

      {/* Success notification */}
      {justSubmitted && (
        <div style={{
          padding: 16, marginBottom: 20,
          background: "rgba(34,197,94,0.08)",
          border: "2px solid #22c55e",
          borderRadius: 14, textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>You're entered!</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Your entry code:</div>
          <div style={{
            fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: 4,
            fontFamily: "monospace", background: "rgba(34,197,94,0.08)",
            padding: "8px 20px", borderRadius: 8, display: "inline-block",
          }}>
            {latestCode}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            Save this code! Winners notified by email.
          </div>
        </div>
      )}

      {/* Campaign Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {campaigns.map((campaign) => {
          const isEntered = entered.includes(campaign.id);
          const canEnter = totalScore >= 500;

          return (
            <div key={campaign.id} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: 20,
              position: "relative", overflow: "hidden",
            }}>
              {/* Color accent bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: campaign.color }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${campaign.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                  }}>
                    {campaign.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{campaign.title}</div>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: "rgba(251,191,36,0.15)", color: "#fbbf24", marginTop: 4 }}>
                      Prize: {campaign.prize}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: "#64748b" }}>ENDS IN</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{campaign.endsIn}</div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, margin: "0 0 14px" }}>
                {campaign.description}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>👥 {campaign.entries.toLocaleString()} entries</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Your score: <strong style={{ color: "#fbbf24" }}>{totalScore}</strong>
                </span>
              </div>

              <button
                onClick={() => !isEntered && canEnter && setShowEntryFor(campaign.id)}
                disabled={isEntered || !canEnter}
                style={{
                  background: isEntered ? "rgba(34,197,94,0.1)" : canEnter ? "#fbbf24" : "rgba(255,255,255,0.05)",
                  color: isEntered ? "#22c55e" : canEnter ? "#1a1a1a" : "#64748b",
                  border: isEntered ? "1px solid #22c55e50" : "none",
                  borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14,
                  cursor: isEntered || !canEnter ? "not-allowed" : "pointer",
                  width: "100%", opacity: !canEnter && !isEntered ? 0.6 : 1,
                }}
              >
                {isEntered ? "✅ Entered!" : !canEnter ? "🔒 Earn 500pts to enter" : "Enter to Win →"}
              </button>

              {showEntryFor === campaign.id && (
                <EntryForm
                  title={campaign.title}
                  name={name}
                  email={email}
                  onName={setName}
                  onEmail={setEmail}
                  onSubmit={() => handleSubmit(campaign.id)}
                  onCancel={() => setShowEntryFor(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Ways to earn */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
          HOW TO EARN MORE ENTRIES
        </div>
        {[
          { emoji: "⚡", text: "Answer quiz questions", pts: "+100–750 pts each" },
          { emoji: "🔥", text: "Maintain streaks", pts: "+25% bonus" },
          { emoji: "⏱", text: "Answer quickly", pts: "+time bonus" },
          { emoji: "📈", text: "Level up difficulty", pts: "+higher rewards" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", marginBottom: 8,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <span style={{ fontSize: 20 }}>{item.emoji}</span>
            <div style={{ flex: 1, fontSize: 13, color: "#fff" }}>{item.text}</div>
            <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
              {item.pts}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.5, marginTop: 20, textAlign: "center" }}>
        No purchase necessary. Winners selected randomly from valid entries.
        One entry per person per campaign. Must be 18+ to enter.
      </p>
    </div>
  );
}

function EntryForm({ title, name, email, onName, onEmail, onSubmit, onCancel }: {
  title: string;
  name: string;
  email: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ marginTop: 16, padding: 16, background: "rgba(0,0,0,0.25)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>
        Enter: {title}
      </div>
      {["Full Name", "Email Address"].map((label, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4, display: "block", letterSpacing: 0.5 }}>
            {label.toUpperCase()}
          </label>
          <input
            type={i === 1 ? "email" : "text"}
            value={i === 0 ? name : email}
            onChange={(e) => (i === 0 ? onName : onEmail)(e.target.value)}
            placeholder={i === 0 ? "Your name" : "your@email.com"}
            style={{
              width: "100%", padding: "10px 14px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8, color: "#fff", fontSize: 14, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onSubmit}
          disabled={!name.trim() || !email.trim()}
          style={{
            flex: 2, background: "#fbbf24", color: "#1a1a1a", border: "none",
            borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14,
            cursor: !name.trim() || !email.trim() ? "not-allowed" : "pointer",
            opacity: !name.trim() || !email.trim() ? 0.6 : 1,
          }}
        >
          Submit Entry 🎉
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1, background: "rgba(255,255,255,0.06)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "12px", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
