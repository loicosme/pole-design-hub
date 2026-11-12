import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
  block?: boolean;
};

export function Button({ variant = "primary", block = true, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        "min-h-12 rounded-xl border-2 px-5 py-2.5 text-[17px] font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:border-line disabled:bg-steel disabled:text-ink-soft",
        variant === "primary" && "border-hazard bg-hazard text-night hover:bg-hazard-deep",
        variant === "secondary" && "border-edge bg-sheet text-ink hover:bg-sky",
        variant === "quiet" && "border-transparent bg-transparent text-ink underline underline-offset-4",
        block && "w-full",
        className,
      )}
    />
  );
}

export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[15px] font-semibold">
        {label}
        {hint && <span className="font-normal text-ink-soft"> {hint}</span>}
      </span>
      <input
        {...props}
        className="h-12 w-full rounded-xl border-2 border-edge bg-sheet px-3 text-[17px] placeholder:text-ink-soft/60"
      />
    </label>
  );
}

export function ChoiceChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[15px] font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? "" : o)}
              className={cx(
                "min-h-11 rounded-xl border-2 px-3.5 text-[15px] font-medium",
                on ? "border-hazard bg-hazard/15 text-hazard" : "border-line bg-sheet text-ink",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** A flat panel. Used for anything that reads as a sheet of the drawing set. */
export function Sheet({
  children,
  className,
  pad = "p-4",
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  /** Padding utility. Pass "p-0" for lists that run edge to edge. */
  pad?: string;
  /** Locked or unavailable. */
  muted?: boolean;
}) {
  return (
    <section className={cx("rounded-xl border-2", muted ? "border-line" : "border-edge bg-sheet", pad, className)}>
      {children}
    </section>
  );
}

/**
 * The stamped metal tag nailed to every pole. Here it carries the numbers
 * that matter: score, rank, level.
 */
export function PoleTag({
  value,
  label,
  tone = "steel",
  size = "md",
}: {
  value: ReactNode;
  label: string;
  tone?: "steel" | "hazard";
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cx(
        "relative inline-flex min-w-[4.75rem] flex-col items-center rounded-lg border-2 border-edge",
        size === "lg" ? "px-6 py-2" : "px-4 py-1",
        tone === "hazard" ? "border-hazard bg-hazard text-night" : "bg-steel",
      )}
    >
      <span aria-hidden className="absolute left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-current opacity-50" />
      <span aria-hidden className="absolute right-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-current opacity-50" />
      <span
        className={cx(
          "font-display tabular font-bold leading-none",
          size === "lg" ? "text-[40px]" : "text-[26px]",
        )}
      >
        {value}
      </span>
      <span className="text-[12px] font-medium leading-tight opacity-80">{label}</span>
    </div>
  );
}

export function Notice({ tone, children }: { tone: "good" | "bad" | "info"; children: ReactNode }) {
  return (
    <div
      role={tone === "bad" ? "alert" : "status"}
      className={cx(
        "rounded-xl border-2 px-3.5 py-2.5 text-[15px]",
        tone === "good" && "border-glass bg-glass-tint text-ink",
        tone === "bad" && "border-stop bg-stop-tint text-ink",
        tone === "info" && "border-line bg-sheet text-ink",
      )}
    >
      {children}
    </div>
  );
}

/** A short burst for a correct answer. Skipped when the device asks for reduced motion. */
export function Confetti() {
  const colors = ["#fbbf24", "#22c55e", "#0ea5e9", "#a855f7", "#ef4444"];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${(i * 37) % 100}%`,
            width: 6 + (i % 4) * 2,
            height: 6 + (i % 4) * 2,
            background: colors[i % 5],
            borderRadius: i % 2 ? 2 : "50%",
            animation: `confetti-fall ${1.8 + (i % 5) * 0.2}s ease-in ${(i % 7) * 0.08}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

export { cx };
