import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { campaigns } from "../data/puzzles";
import { RESUME_UNLOCK_THRESHOLD } from "../branding";

interface Props {
  totalScore: number;
  level: number;
  playerId: Id<"players">;
}

export default function CampaignPanel({ totalScore, playerId }: Props) {
  const [entered, setEntered] = useState<string[]>([]);
  const [latestCode, setLatestCode] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Resume upload state
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const submitResume = useMutation(api.resumes.submit);
  const existingResume = useQuery(api.resumes.getByPlayer, { playerId });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeSuccess, setResumeSuccess] = useState(false);

  const canUnlock = totalScore >= RESUME_UNLOCK_THRESHOLD;
  const progressPct = Math.min((totalScore / RESUME_UNLOCK_THRESHOLD) * 100, 100);

  async function handleResumeUpload(file: File) {
    setResumeUploading(true);
    setResumeError("");
    try {
      const uploadUrl = await generateUploadUrl({ playerId });
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      await submitResume({ playerId, storageId, filename: file.name });
      setResumeSuccess(true);
    } catch {
      setResumeError("Upload failed. Please try again.");
    } finally {
      setResumeUploading(false);
    }
  }

  function handleSubmit(campaignId: string) {
    const code = `PWR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setLatestCode(code);
    setEntered((prev) => [...prev, campaignId]);
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 6000);
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>Win Prizes</h2>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>
        Complete challenges, enter to win real prizes.
      </p>

      {/* ── Resume Upload CTA ── */}
      <div style={{
        marginBottom: 24,
        padding: 18,
        borderRadius: 16,
        border: canUnlock ? "2px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
        background: canUnlock ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.03)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: canUnlock ? "#fbbf24" : "rgba(255,255,255,0.08)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>{canUnlock ? "📄" : "🔒"}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: canUnlock ? "#fbbf24" : "#fff" }}>
              {canUnlock ? "Submit Your Resume" : "Unlock Resume Submission"}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {canUnlock
                ? "You've earned the right to apply! Upload your CV."
                : `Reach ${RESUME_UNLOCK_THRESHOLD} pts to unlock — you're at ${totalScore}`}
            </div>
          </div>
        </div>

        {!canUnlock && (
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: "#fbbf24", width: `${progressPct}%`, transition: "width 0.5s" }} />
          </div>
        )}

        {canUnlock && !resumeSuccess && !existingResume && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleResumeUpload(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={resumeUploading}
              style={{
                marginTop: 10,
                width: "100%",
                padding: "13px",
                background: resumeUploading ? "rgba(255,255,255,0.08)" : "#fbbf24",
                color: resumeUploading ? "#64748b" : "#1a1a1a",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: resumeUploading ? "not-allowed" : "pointer",
              }}
            >
              {resumeUploading ? "Uploading…" : "📎 Upload Resume (PDF / DOC)"}
            </button>
            {resumeError && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#ef4444" }}>{resumeError}</div>
            )}
          </>
        )}

        {(resumeSuccess || existingResume) && (
          <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid #22c55e", fontSize: 13, color: "#22c55e", fontWeight: 700 }}>
            ✅ Resume submitted! Our team will be in touch.
          </div>
        )}
      </div>

      {/* Score requirement for campaigns */}
      {totalScore < RESUME_UNLOCK_THRESHOLD && (
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
              Earn {RESUME_UNLOCK_THRESHOLD} points to enter prize campaigns.<br />
              You have <strong style={{ color: "#fff" }}>{totalScore}</strong> pts — keep quizzing!
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
          const canEnter = totalScore >= RESUME_UNLOCK_THRESHOLD;

          return (
            <div key={campaign.id} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: 20,
              position: "relative", overflow: "hidden",
            }}>
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
                onClick={() => !isEntered && canEnter && handleSubmit(campaign.id)}
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
                {isEntered ? "✅ Entered!" : !canEnter ? `🔒 Earn ${RESUME_UNLOCK_THRESHOLD}pts to enter` : "Enter to Win →"}
              </button>
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

