import { useState } from "react";
import { poleComponents, type PoleComponent } from "../data/puzzles";

export default function PoleExplorer() {
  const [selected, setSelected] = useState<PoleComponent | null>(null);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#fff" }}>
          Utility Pole Explorer
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
          Tap any component to learn how it works
        </p>
      </div>

      {/* SVG Pole Diagram */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", marginBottom: 8, letterSpacing: 2, fontWeight: 600 }}>
          INTERACTIVE POLE DIAGRAM
        </div>
        <PoleDiagram selected={selected} onSelect={setSelected} />
      </div>

      {/* Selected Component Info */}
      {selected && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: `2px solid ${selected.color}`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: `${selected.color}22`,
              border: `2px solid ${selected.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              {selected.emoji}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{selected.name}</div>
              {selected.voltage && (
                <span style={{
                  display: "inline-block", marginTop: 4,
                  background: "rgba(251,191,36,0.15)", color: "#fbbf24",
                  padding: "2px 8px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                }}>
                  {selected.voltage}
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 12px" }}>
            {selected.description}
          </p>
          <div style={{
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.15)",
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <div>
              <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, marginBottom: 2 }}>FUN FACT</div>
              <div style={{ fontSize: 13, color: "#d1a226", lineHeight: 1.4 }}>{selected.funFact}</div>
            </div>
          </div>
        </div>
      )}

      {/* Component Grid */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
          ALL COMPONENTS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {poleComponents.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              style={{
                background: selected?.id === c.id ? `${c.color}15` : "rgba(255,255,255,0.04)",
                border: `2px solid ${selected?.id === c.id ? c.color : "rgba(255,255,255,0.07)"}`,
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                transform: selected?.id === c.id ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{c.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick reference card */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24", marginBottom: 12 }}>
          ⚡ Pole Zone Reference
        </div>
        {[
          { zone: "Top Zone", color: "#ef4444", items: "Transmission wires (69kV+)" },
          { zone: "Supply Space", color: "#f59e0b", items: "Primary distribution (4–35kV)" },
          { zone: "Transformer Zone", color: "#fbbf24", items: "Step-down units, cutouts, arresters" },
          { zone: "Secondary Space", color: "#0ea5e9", items: "Service lines (120/240V)" },
          { zone: "Neutral Wire", color: "#6b7280", items: "Return path (grounded)" },
          { zone: "Comm Space", color: "#34d399", items: "Cable, phone, fiber (lowest)" },
        ].map((z) => (
          <div key={z.zone} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: z.color, flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{z.zone}: </span>
              <span style={{ fontSize: 13, color: "#64748b" }}>{z.items}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PoleDiagram({ selected, onSelect }: {
  selected: PoleComponent | null;
  onSelect: (c: PoleComponent) => void;
}) {
  const compMap: Record<string, PoleComponent> = {};
  for (const c of poleComponents) compMap[c.id] = c;

  const isSel = (id: string) => selected?.id === id;

  return (
    <svg viewBox="0 0 320 460" style={{ width: "100%", maxHeight: 380 }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0f1e" />
          <stop offset="100%" stopColor="#0f1a2e" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="460" fill="url(#sky)" rx="8" />

      {/* Stars */}
      {[30, 80, 140, 200, 260, 290, 50, 170, 230, 110, 300].map((x, i) => (
        <circle key={i} cx={x} cy={i * 5 + 8} r="1.2" fill="white" opacity={0.3 + (i % 3) * 0.1} />
      ))}

      {/* Main pole */}
      <rect x="152" y="30" width="16" height="400" fill="#92400e" rx="2" />
      <rect x="153" y="30" width="4" height="400" fill="#b45309" rx="1" opacity="0.4" />

      {/* Ground */}
      <rect x="0" y="420" width="320" height="40" fill="#0d1f35" rx="0" />
      <ellipse cx="160" cy="428" rx="45" ry="9" fill="#1e3a5f" />

      {/* Cross arm */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect(compMap.crossarm)}>
        <rect x="60" y="76" width="200" height="12"
          fill={isSel("crossarm") ? "#a78bfa" : "#5b21b6"}
          rx="2"
          filter={isSel("crossarm") ? "url(#glow)" : undefined}
        />
        {/* Insulators */}
        {[82, 160, 238].map((x, i) => (
          <g key={i} style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); onSelect(compMap.insulator); }}>
            <ellipse cx={x} cy="74" rx="9" ry="5"
              fill={isSel("insulator") ? "#38bdf8" : "#0369a1"}
              filter={isSel("insulator") ? "url(#glow)" : undefined}
            />
            <ellipse cx={x} cy="71" rx="7" ry="4" fill={isSel("insulator") ? "#7dd3fc" : "#0284c7"} />
          </g>
        ))}

        {/* High voltage wires */}
        <line x1="0" y1="68" x2="82" y2="68" stroke="#fbbf24" strokeWidth="2.5" opacity="0.9" />
        <line x1="82" y1="68" x2="320" y2="74" stroke="#fbbf24" strokeWidth="2.5" opacity="0.9" />
        <line x1="0" y1="69" x2="160" y2="67" stroke="#f59e0b" strokeWidth="2" opacity="0.7" />
        <line x1="0" y1="75" x2="238" y2="68" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
      </g>

      {/* Lightning arrester */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect(compMap.arrester)}>
        <rect x="176" y="96" width="14" height="30"
          fill={isSel("arrester") ? "#fde68a" : "#d97706"}
          rx="3"
          filter={isSel("arrester") ? "url(#glow)" : undefined}
        />
        <line x1="183" y1="126" x2="183" y2="158" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="196" y="112" fontSize="10" fill="#fbbf24" opacity="0.9">ARR</text>
      </g>

      {/* Transformer */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect(compMap.transformer)}>
        <rect x="128" y="158" width="64" height="72"
          fill={isSel("transformer") ? "#fbbf24" : "#b45309"}
          rx="6"
          filter={isSel("transformer") ? "url(#glow)" : undefined}
        />
        <rect x="136" y="166" width="48" height="56" fill={isSel("transformer") ? "#fde68a" : "#d97706"} rx="4" />
        <text x="160" y="198" textAnchor="middle" fontSize="12" fill="#1a0a00" fontWeight="bold">TX</text>
        <text x="160" y="214" textAnchor="middle" fontSize="8" fill="#431407">7.2kV→240V</text>
        {[125, 129, 133].map((x, i) => (
          <rect key={i} x={x} y="163" width="2" height="62" fill="#92400e" rx="1" opacity="0.5" />
        ))}
      </g>

      {/* Fuse cutout */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect(compMap.fuse)}>
        <rect x="103" y="168" width="17" height="38"
          fill={isSel("fuse") ? "#fca5a5" : "#b91c1c"}
          rx="4"
          filter={isSel("fuse") ? "url(#glow)" : undefined}
        />
        <line x1="111.5" y1="168" x2="111.5" y2="206" stroke={isSel("fuse") ? "#fff" : "#fecaca"} strokeWidth="1.5" />
        <text x="88" y="190" fontSize="8" fill="#ef4444" opacity="0.8">FUSE</text>
      </g>

      {/* Street light */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect(compMap.streetlight)}>
        <rect x="60" y="98" width="42" height="5" fill="#374151" rx="2" />
        <rect x="62" y="78" width="3" height="26" fill="#4b5563" />
        <ellipse cx="70" cy="75" rx="14" ry="8"
          fill={isSel("streetlight") ? "#fef08a" : "#fde68a"}
          filter={isSel("streetlight") ? "url(#glow)" : undefined}
        />
        {isSel("streetlight") && (
          <ellipse cx="70" cy="75" rx="20" ry="14" fill="#fbbf24" opacity="0.08" />
        )}
        <text x="70" y="78" textAnchor="middle" fontSize="9" fill="#92400e">LIGHT</text>
      </g>

      {/* Neutral wire area */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect(compMap.neutral)}>
        <line x1="0" y1="262" x2="320" y2="266"
          stroke={isSel("neutral") ? "#cbd5e1" : "#64748b"}
          strokeWidth="3"
          filter={isSel("neutral") ? "url(#glow)" : undefined}
        />
        <line x1="0" y1="272" x2="320" y2="276" stroke={isSel("neutral") ? "#94a3b8" : "#475569"} strokeWidth="2.5" />
        <text x="270" y="258" fontSize="8" fill="#64748b">NEUTRAL</text>
      </g>

      {/* Communication lines */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect(compMap.cablecom)}>
        <line x1="0" y1="342" x2="320" y2="346"
          stroke={isSel("cablecom") ? "#4ade80" : "#16a34a"}
          strokeWidth="2.5"
          filter={isSel("cablecom") ? "url(#glow)" : undefined}
        />
        <line x1="0" y1="352" x2="320" y2="356" stroke={isSel("cablecom") ? "#34d399" : "#15803d"} strokeWidth="2" />
        <text x="248" y="338" fontSize="8" fill="#22c55e">CABLE/COMM</text>
      </g>

      {/* Zone labels */}
      <text x="6" y="82" fontSize="8" fill="#fbbf24" opacity="0.6">PRIMARY 7.2kV</text>
      <text x="6" y="268" fontSize="8" fill="#64748b">SECONDARY/NEUTRAL</text>
      <text x="6" y="356" fontSize="8" fill="#22c55e">COMMUNICATION</text>

      {/* Tap hint */}
      {!selected && (
        <text x="160" y="448" textAnchor="middle" fontSize="11" fill="#475569">
          Tap a component to learn more
        </text>
      )}
      {selected && (
        <text x="160" y="448" textAnchor="middle" fontSize="11" fill="#fbbf24">
          {selected.name} selected
        </text>
      )}
    </svg>
  );
}
