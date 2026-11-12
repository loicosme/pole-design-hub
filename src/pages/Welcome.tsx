import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { BRAND, CONSENT_VERSION, PROFILE_BONUS, consentText } from "../branding";
import type { BoardRow } from "../components/Board";
import { PoleDiagram } from "../components/PoleExplorer";
import { Button, Field, Notice } from "../components/ui";
import { errorMessage, type Attribution } from "../lib/session";

export default function Welcome({
  attribution,
  onRegistered,
}: {
  attribution: Attribution;
  onRegistered: (id: Id<"players">) => void;
}) {
  const register = useMutation(api.players.register);
  const top = useQuery(api.leaderboard.top, { limit: 3 }) as BoardRow[] | undefined;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!name.trim() || !email.trim()) return setError("Enter your name and email to start.");
    if (!consent) return setError("Tick the box to agree before you start.");
    setBusy(true);
    setError("");
    try {
      const id = await register({
        name,
        email,
        consent,
        consentVersion: CONSENT_VERSION,
        eventCode: attribution.eventCode,
        source: attribution.source,
      });
      onRegistered(id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't sign you up. Check your connection and try again."));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4">
      <p className="font-display text-[20px] font-bold">{BRAND.appName}</p>

      <div className="mt-3 flex items-start gap-2">
        <div className="flex-1 pt-2">
          <h1 className="font-display text-[46px] font-bold leading-[0.95]">{BRAND.headline}</h1>
          <p className="mt-3 text-[17px] text-ink-soft">{BRAND.pitch}</p>
        </div>
        <PoleDiagram className="-mr-2 w-[42%] shrink-0" />
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-md border-2 border-ink bg-sheet p-4" noValidate>
        <Field
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          enterKeyHint="go"
        />
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-6 shrink-0 accent-ink"
          />
          <span className="text-[15px] leading-snug">
            {consentText()}
            {BRAND.privacyContact && ` Contact: ${BRAND.privacyContact}.`}
          </span>
        </label>
        {error && <Notice tone="bad">{error}</Notice>}
        <Button type="submit" disabled={busy} className="min-h-14 text-[20px]">
          {busy ? "Signing you up" : "Start round 1"}
        </Button>
        <p className="text-[14px] text-ink-soft">
          That's all we need to start. Add your school after the first round for {PROFILE_BONUS} bonus points.
        </p>
      </form>

      {top && top.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-[22px] font-semibold">Scores to beat</h2>
          <ol className="mt-1">
            {top.map((r) => (
              <li key={r.rank} className="flex items-baseline gap-3 border-b border-line py-2">
                <span className="font-display tabular w-5 text-[22px] font-bold">{r.rank}</span>
                <span className="flex-1 truncate font-medium">{r.name}</span>
                <span className="font-display tabular text-[22px] font-bold">{r.totalScore.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
