import { useState } from "react";
import { poleComponents, poleZones, type PoleComponent } from "../data/puzzles";
import { Sheet, cx } from "./ui";

const INK = "#0f1b2d";
const HAZARD = "#ffc914";
const POLE = "#6b4423";
const STEEL = "#d5dbe2";

// Where each balloon sits, and where its leader line lands on the drawing.
const BALLOONS: Record<string, { bx: number; by: number; tx: number; ty: number }> = {
  insulator: { bx: 22, by: 40, tx: 80, ty: 60 },
  crossarm: { bx: 298, by: 40, tx: 246, ty: 72 },
  arrester: { bx: 298, by: 88, tx: 186, ty: 100 },
  fuse: { bx: 298, by: 124, tx: 209, ty: 120 },
  transformer: { bx: 298, by: 184, tx: 215, ty: 184 },
  neutral: { bx: 22, by: 226, tx: 34, ty: 250 },
  streetlight: { bx: 298, by: 268, tx: 232, ty: 284 },
  cablecom: { bx: 22, by: 352, tx: 34, ty: 328 },
  guy: { bx: 22, by: 150, tx: 132, ty: 152 },
};

export function PoleDiagram({
  selectedId,
  onSelect,
  className,
}: {
  selectedId?: string | null;
  /** Leave out for a static illustration. */
  onSelect?: (c: PoleComponent) => void;
  className?: string;
}) {
  const sel = (id: string) => selectedId === id;
  const fill = (id: string, base: string) => (sel(id) ? HAZARD : base);
  const interactive = Boolean(onSelect);

  const group = (id: string) => {
    const c = poleComponents.find((p) => p.id === id)!;
    if (!interactive) return {};
    return {
      role: "button" as const,
      tabIndex: 0,
      "aria-label": `Item ${c.item}: ${c.name}`,
      "aria-pressed": sel(id),
      style: { cursor: "pointer" },
      onClick: () => onSelect!(c),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect!(c);
        }
      },
    };
  };

  const line = { stroke: INK, strokeWidth: 2, fill: "none", strokeLinecap: "round" as const };

  return (
    <svg
      viewBox="0 0 320 420"
      className={className}
      role={interactive ? "group" : "img"}
      aria-label="Drawing of a distribution pole with nine numbered items"
    >
      {/* Ground line with hatching */}
      <line x1="0" y1="392" x2="320" y2="392" stroke={INK} strokeWidth="2" />
      {Array.from({ length: 17 }).map((_, i) => (
        <line key={i} x1={i * 20 + 4} y1="392" x2={i * 20 - 6} y2="404" stroke={INK} strokeWidth="1" opacity="0.45" />
      ))}

      {/* Guy and anchor */}
      <g {...group("guy")}>
        <line x1="154" y1="84" x2="52" y2="392" stroke="transparent" strokeWidth="26" />
        <line x1="154" y1="84" x2="52" y2="392" stroke={sel("guy") ? HAZARD : INK} strokeWidth={sel("guy") ? 5 : 2} />
        <line x1="154" y1="84" x2="52" y2="392" stroke={INK} strokeWidth="1.5" strokeDasharray="1 5" />
        <path d="M44 392 l8 10 l8 -10" {...line} />
      </g>

      {/* Communication cables */}
      <g {...group("cablecom")}>
        <rect x="0" y="312" width="320" height="34" fill="transparent" />
        <path d="M0 322 Q160 330 320 322" {...line} strokeWidth={sel("cablecom") ? 5 : 3} stroke={sel("cablecom") ? HAZARD : INK} />
        <path d="M0 334 Q160 342 320 334" {...line} strokeWidth="1.5" strokeDasharray="6 4" />
      </g>

      {/* Neutral and secondary */}
      <g {...group("neutral")}>
        <rect x="0" y="238" width="320" height="34" fill="transparent" />
        <path d="M0 248 Q160 254 320 248" {...line} strokeWidth={sel("neutral") ? 5 : 2} stroke={sel("neutral") ? HAZARD : INK} />
        <path d="M0 260 Q160 267 320 260" {...line} strokeWidth="3" />
      </g>

      {/* Pole */}
      <rect x="154" y="34" width="12" height="372" fill={POLE} stroke={INK} strokeWidth="2" />
      <rect x="156" y="150" width="8" height="12" fill={STEEL} stroke={INK} strokeWidth="1" />

      {/* Primary conductors (behind insulators) */}
      <path d="M0 56 Q80 62 85 60 Q200 66 320 56" {...line} />
      <path d="M0 30 Q150 36 160 30 Q240 36 320 30" {...line} />
      <path d="M0 60 Q200 66 235 60 Q290 62 320 58" {...line} />

      {/* Crossarm */}
      <g {...group("crossarm")}>
        <rect x="66" y="62" width="188" height="24" fill="transparent" />
        <rect x="70" y="70" width="180" height="9" fill={fill("crossarm", "#8a5a2e")} stroke={INK} strokeWidth="2" />
        <path d="M110 79 L154 104 M210 79 L166 104" {...line} strokeWidth="1.5" />
      </g>

      {/* Insulators */}
      <g {...group("insulator")}>
        {[
          [85, 70],
          [160, 34],
          [235, 70],
        ].map(([x, y]) => (
          <g key={x}>
            <rect x={x - 16} y={y - 22} width="32" height="26" fill="transparent" />
            <path
              d={`M${x - 8} ${y} h16 l-2 -4 h-12 z M${x - 6} ${y - 4} h12 l-2 -4 h-8 z`}
              fill={fill("insulator", "#fbfcfd")}
              stroke={INK}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </g>

      {/* Surge arrester */}
      <g {...group("arrester")}>
        <rect x="168" y="92" width="24" height="44" fill="transparent" />
        <path d="M181 60 V96" {...line} strokeWidth="1.5" />
        <rect x="176" y="96" width="10" height="32" rx="2" fill={fill("arrester", "#fbfcfd")} stroke={INK} strokeWidth="2" />
        <path d="M174 104 h14 M174 112 h14 M174 120 h14" {...line} strokeWidth="1.5" />
      </g>

      {/* Fused cutout */}
      <g {...group("fuse")}>
        <rect x="192" y="96" width="24" height="46" fill="transparent" />
        <path d="M166 112 H198" {...line} strokeWidth="1.5" />
        <path d="M198 104 v30" {...line} strokeWidth="3" />
        <path d="M200 104 L208 132" stroke={sel("fuse") ? HAZARD : INK} strokeWidth={sel("fuse") ? 6 : 4} strokeLinecap="round" />
        <path d="M204 134 V150" {...line} strokeWidth="1.5" />
      </g>

      {/* Transformer */}
      <g {...group("transformer")}>
        <rect x="170" y="150" width="46" height="68" rx="6" fill={fill("transformer", STEEL)} stroke={INK} strokeWidth="2" />
        <path d="M170 164 h46 M170 204 h46" {...line} strokeWidth="1.5" />
        <path d="M182 150 v-8 h8 v8 M200 150 v-8 h8 v8" {...line} strokeWidth="1.5" />
        <text x="193" y="189" textAnchor="middle" fontSize="11" fontWeight="600" fill={INK} fontFamily="Barlow Condensed, sans-serif">
          25 kVA
        </text>
        <path d="M193 218 V248" {...line} strokeWidth="1.5" />
      </g>

      {/* Street light */}
      <g {...group("streetlight")}>
        <rect x="166" y="270" width="72" height="30" fill="transparent" />
        <path d="M166 290 Q200 270 222 280" {...line} />
        <path d="M214 280 h22 l-3 8 h-16 z" fill={fill("streetlight", "#fbfcfd")} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </g>

      {/* Balloons and leaders */}
      {poleComponents.map((c) => {
        const b = BALLOONS[c.id];
        const on = sel(c.id);
        const dx = b.tx - b.bx;
        const dy = b.ty - b.by;
        const len = Math.hypot(dx, dy) || 1;
        const sx = b.bx + (dx / len) * 12;
        const sy = b.by + (dy / len) * 12;
        return (
          <g key={c.id} onClick={interactive ? () => onSelect!(c) : undefined} style={interactive ? { cursor: "pointer" } : undefined} aria-hidden>
            <line x1={sx} y1={sy} x2={b.tx} y2={b.ty} stroke={INK} strokeWidth="1" />
            <circle cx={b.tx} cy={b.ty} r="1.8" fill={INK} />
            <circle cx={b.bx} cy={b.by} r="22" fill="transparent" />
            <g className={on ? "balloon-selected" : undefined}>
              <circle cx={b.bx} cy={b.by} r="12" fill={on ? HAZARD : "#fbfcfd"} stroke={INK} strokeWidth="2" />
              <text x={b.bx} y={b.by + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={INK} fontFamily="Barlow Condensed, sans-serif">
                {c.item}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export default function PoleExplorer() {
  const [selected, setSelected] = useState<PoleComponent | null>(null);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-[34px] font-bold leading-none">Read the pole</h1>
        <p className="mt-1 text-ink-soft">Tap a number. Everything here turns up in the quiz.</p>
      </header>

      <Sheet pad="p-2">
        <PoleDiagram selectedId={selected?.id} onSelect={setSelected} className="mx-auto block w-full max-w-sm" />
      </Sheet>

      <div aria-live="polite">
        {selected ? (
          <Sheet key={selected.id} className="rise border-l-[10px] border-l-hazard">
            <p className="text-[14px] font-medium text-ink-soft">
              Item {selected.item}, {selected.zone.toLowerCase()} space
            </p>
            <h2 className="font-display text-[28px] font-bold leading-tight">{selected.name}</h2>
            <p className="mt-1.5">{selected.description}</p>
            <p className="mt-2 border-t border-line pt-2 text-[15px] text-ink-soft">{selected.detail}</p>
          </Sheet>
        ) : (
          <p className="rounded-md border-2 border-dashed border-line px-4 py-3 text-ink-soft">
            Nothing selected yet. Start with item 5, the one that feeds your house.
          </p>
        )}
      </div>

      <Sheet pad="p-0">
        <h2 className="border-b-2 border-ink px-4 py-2 font-display text-[20px] font-semibold">Item list</h2>
        <ul>
          {poleComponents.map((c) => (
            <li key={c.id} className="border-b border-line last:border-b-0">
              <button
                onClick={() => setSelected(c)}
                className={cx(
                  "flex min-h-12 w-full items-center gap-3 px-4 text-left",
                  selected?.id === c.id && "bg-hazard/30",
                )}
              >
                <span className="font-display tabular w-5 text-[20px] font-bold">{c.item}</span>
                <span className="flex-1 font-medium">{c.name}</span>
                <span className="text-[14px] text-ink-soft">{c.zone}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet>
        <h2 className="font-display text-[20px] font-semibold">Spaces on the pole, top to bottom</h2>
        <dl className="mt-2 space-y-1.5 text-[15px]">
          {poleZones.map((z) => (
            <div key={z.zone} className="flex gap-3">
              <dt className="w-32 shrink-0 font-semibold">{z.zone}</dt>
              <dd className="text-ink-soft">{z.text}</dd>
            </div>
          ))}
        </dl>
      </Sheet>
    </div>
  );
}
