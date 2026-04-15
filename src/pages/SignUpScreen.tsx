import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { BRAND } from "../branding";

interface Props {
  onRegistered: (playerId: Id<"players">) => void;
}

const roleOptions = [
  "Engineering",
  "Operations",
  "Internship",
  "Other / Not sure",
];

const gradYearOptions = Array.from({ length: 8 }, (_, i) =>
  String(new Date().getFullYear() + i)
);

export default function SignUpScreen({ onRegistered }: Props) {
  const registerPlayer = useMutation(api.players.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [roleInterest, setRoleInterest] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid =
    name.trim() &&
    email.trim() &&
    consent;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError("");
    try {
      const id = await registerPlayer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        school: school.trim(),
        gradYear,
        roleInterest,
      });
      onRegistered(id);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 6,
    letterSpacing: 1,
  };

  return (
    <div
      style={{
        width: "min(100%, 480px)",
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: BRAND.bgColor,
        padding: "0 0 40px",
      }}
    >
      {/* Hero header */}
      <div
        style={{
          padding: "40px 24px 24px",
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            color: BRAND.accentColor,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          {BRAND.tagline}
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 900,
            margin: "0 0 8px",
            color: "#fff",
            lineHeight: 1.2,
          }}
        >
          {BRAND.appName}
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
          Answer engineering questions, earn points, and unlock the chance to
          submit your resume to our team.
        </p>

        {/* Reward teaser */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {[
            { emoji: "⚡", text: "Quiz challenges" },
            { emoji: "🏆", text: "Live leaderboard" },
            { emoji: "📄", text: "Resume unlock at 500pts" },
          ].map((f, i) => (
            <span
              key={i}
              style={{
                padding: "5px 12px",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 600,
                background: "rgba(251,191,36,0.10)",
                color: "#fbbf24",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              {f.emoji} {f.text}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Create your player profile
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>FULL NAME *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>EMAIL ADDRESS *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            required
            style={inputStyle}
          />
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>PHONE NUMBER <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span></label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            style={inputStyle}
          />
        </div>

        {/* School */}
        <div>
          <label style={labelStyle}>UNIVERSITY / SCHOOL <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span></label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="University of ..."
            style={inputStyle}
          />
        </div>

        {/* Grad Year */}
        <div>
          <label style={labelStyle}>GRADUATION YEAR <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span></label>
          <select
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            style={{ ...inputStyle, appearance: "none" }}
          >
            <option value="" disabled>
              Select year
            </option>
            {gradYearOptions.map((y) => (
              <option key={y} value={y} style={{ background: "#0a0f1e" }}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Role Interest */}
        <div>
          <label style={labelStyle}>AREA OF INTEREST <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span></label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {roleOptions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleInterest(r)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: roleInterest === r
                    ? `2px solid ${BRAND.accentColor}`
                    : "1px solid rgba(255,255,255,0.14)",
                  background: roleInterest === r
                    ? "rgba(251,191,36,0.12)"
                    : "rgba(255,255,255,0.04)",
                  color: roleInterest === r ? BRAND.accentColor : "#94a3b8",
                  transition: "all 0.15s",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Consent */}
        <label
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            cursor: "pointer",
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ marginTop: 2, accentColor: BRAND.accentColor, width: 16, height: 16 }}
          />
          <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
            I agree to share my details with the recruiting team for talent
            consideration. My data will be used solely for this purpose.
          </span>
        </label>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid #ef4444",
              color: "#ef4444",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!valid || loading}
          style={{
            marginTop: 4,
            background: valid && !loading ? BRAND.accentColor : "rgba(255,255,255,0.08)",
            color: valid && !loading ? "#1a1a1a" : "#475569",
            border: "none",
            borderRadius: 12,
            padding: "15px 24px",
            fontWeight: 800,
            fontSize: 16,
            cursor: valid && !loading ? "pointer" : "not-allowed",
            width: "100%",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Setting up your profile…" : "⚡ Start Playing"}
        </button>
      </form>
    </div>
  );
}
