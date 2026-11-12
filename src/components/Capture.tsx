// The data-capture steps. Each one is offered when the player has a reason
// to care: after a round, at a score milestone, or on the Rewards tab.

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  DRAW,
  LOOKING_FOR,
  PROFILE_BONUS,
  PROGRAMS,
  RESUME_UNLOCK_THRESHOLD,
  ROLE_INTERESTS,
  SCHOOL_SUGGESTIONS,
} from "../branding";
import { errorMessage } from "../lib/session";
import { Button, ChoiceChips, Field, Notice } from "./ui";

export interface Me {
  name: string;
  totalScore: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  correctCount: number;
  answeredCount: number;
  school: string;
  program: string;
  gradYear: string;
  lookingFor: string;
  roleInterest: string;
  profileComplete: boolean;
  profileBonusClaimed: boolean;
  followUpAnswered: boolean;
  contactOptIn: boolean;
}

const thisYear = new Date().getFullYear();
const GRAD_YEARS = [...Array.from({ length: 5 }, (_, i) => String(thisYear + i)), "Graduated"];

export function ProfileForm({ playerId, me }: { playerId: Id<"players">; me: Me }) {
  const update = useMutation(api.players.updateProfile);
  const [school, setSchool] = useState(me.school);
  const [program, setProgram] = useState(me.program);
  const [gradYear, setGradYear] = useState(me.gradYear);
  const [lookingFor, setLookingFor] = useState(me.lookingFor);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ready = school.trim() && program && gradYear && lookingFor;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      await update({ id: playerId, school, program, gradYear, lookingFor });
    } catch (err) {
      setError(errorMessage(err, "Couldn't save. Check your connection and try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Field
        label="School"
        value={school}
        onChange={(e) => setSchool(e.target.value)}
        list="schools"
        placeholder="Start typing"
        autoComplete="organization"
      />
      <datalist id="schools">
        {SCHOOL_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <ChoiceChips label="Program" options={PROGRAMS} value={program} onChange={setProgram} />
      <ChoiceChips label="Graduating" options={GRAD_YEARS} value={gradYear} onChange={setGradYear} />
      <ChoiceChips label="Looking for" options={LOOKING_FOR} value={lookingFor} onChange={setLookingFor} />
      {error && <Notice tone="bad">{error}</Notice>}
      <Button type="submit" disabled={!ready || busy}>
        {busy ? "Saving" : me.profileBonusClaimed ? "Save profile" : `Save profile and collect ${PROFILE_BONUS} points`}
      </Button>
    </form>
  );
}

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export function ResumeUpload({ playerId }: { playerId: Id<"players"> }) {
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const submit = useMutation(api.resumes.submit);
  const existing = useQuery(api.resumes.getByPlayer, { playerId });
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    if (file.size > MAX_RESUME_BYTES) {
      setError("That file is over 5 MB. Export a smaller PDF and try again.");
      return;
    }
    setBusy(true);
    try {
      const url: string = await generateUploadUrl({ playerId });
      let storageId = "demo";
      if (!url.startsWith("demo:")) {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
        storageId = (await res.json()).storageId;
      }
      await submit({ playerId, storageId: storageId as Id<"_storage">, filename: file.name });
    } catch (err) {
      setError(errorMessage(err, "The upload didn't go through. Check your connection and try again."));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {existing && (
        <Notice tone="good">
          ✅ Résumé sent: <strong className="break-all font-semibold">{existing.filename}</strong>
        </Notice>
      )}
      <input
        ref={input}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf"
        className="sr-only"
        aria-label="Choose a résumé file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <Button variant={existing ? "secondary" : "primary"} disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Sending" : existing ? "Send a newer version" : "📎 Send résumé"}
      </Button>
      <p className="text-[14px] text-ink-soft">PDF or Word, up to 5 MB.</p>
      {error && <Notice tone="bad">{error}</Notice>}
    </div>
  );
}

export function DrawEntry({ playerId }: { playerId: Id<"players"> }) {
  const enter = useMutation(api.draw.enter);
  const entry = useQuery(api.draw.mine, { playerId });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (entry) {
    return (
      <Notice tone="good">
        🎉 You're entered. Your code is{" "}
        <strong className="font-display tabular text-[22px] font-bold tracking-wider">{entry.code}</strong>. Show it at
        the booth if your name is drawn.
      </Notice>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await enter({ playerId });
          } catch (err) {
            setError(errorMessage(err, "Couldn't enter the draw. Try again."));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Entering" : "🎟 Enter the draw"}
      </Button>
      <p className="text-[14px] text-ink-soft">{DRAW.rules}</p>
      {error && <Notice tone="bad">{error}</Notice>}
    </div>
  );
}

export function FollowUpForm({ playerId, me }: { playerId: Id<"players">; me: Me }) {
  const update = useMutation(api.players.updateProfile);
  const [roleInterest, setRoleInterest] = useState(me.roleInterest);
  const [linkedin, setLinkedin] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function answer(contactOptIn: boolean) {
    setBusy(true);
    setError("");
    try {
      await update({ id: playerId, contactOptIn, ...(contactOptIn ? { roleInterest, linkedin, phone } : {}) });
    } catch (err) {
      setError(errorMessage(err, "Couldn't save. Try again."));
    } finally {
      setBusy(false);
    }
  }

  if (me.followUpAnswered) {
    return (
      <div className="space-y-3">
        <Notice tone={me.contactOptIn ? "good" : "info"}>
          {me.contactOptIn ? "We'll be in touch after the event." : "No follow-up. You won't hear from us."}
        </Notice>
        <Button variant="secondary" disabled={busy} onClick={() => answer(!me.contactOptIn)}>
          {me.contactOptIn ? "Stop follow-up" : "Actually, follow up with me"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChoiceChips label="Most interested in" options={ROLE_INTERESTS} value={roleInterest} onChange={setRoleInterest} />
      <Field
        label="LinkedIn"
        hint="(optional)"
        value={linkedin}
        onChange={(e) => setLinkedin(e.target.value)}
        placeholder="linkedin.com/in/you"
        inputMode="url"
        autoCapitalize="none"
      />
      <Field
        label="Phone"
        hint="(optional)"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="tel"
      />
      {error && <Notice tone="bad">{error}</Notice>}
      <Button disabled={busy} onClick={() => answer(true)}>
        👍 Yes, follow up with me
      </Button>
      <Button variant="quiet" disabled={busy} onClick={() => answer(false)}>
        No thanks
      </Button>
    </div>
  );
}

export type StepId = "profile" | "resume" | "draw" | "followup";

/** The single most useful thing to ask this player for right now, or null. */
export function useNextStep(playerId: Id<"players">, me: Me): StepId | null {
  const resume = useQuery(api.resumes.getByPlayer, { playerId });
  const entry = useQuery(api.draw.mine, { playerId });
  const unlocked = me.totalScore >= RESUME_UNLOCK_THRESHOLD;
  if (!me.profileComplete) return "profile";
  if (unlocked && resume === null) return "resume";
  if (unlocked && DRAW.enabled && entry === null) return "draw";
  if (!me.followUpAnswered) return "followup";
  return null;
}

export const STEP_COPY: Record<StepId, { title: string; body: string }> = {
  profile: {
    title: `🎓 Add your school for ${PROFILE_BONUS} points`,
    body: "Four taps. It tells us which openings fit you.",
  },
  resume: {
    title: "📄 You've unlocked résumé drop-off",
    body: "It goes straight to the engineers at this booth, with your score attached.",
  },
  draw: { title: `🎟 ${DRAW.title}`, body: `${DRAW.prize}. ${DRAW.closes}.` },
  followup: {
    title: "🤝 Want to hear from us after today?",
    body: "Tell us what you're curious about and we'll match you with the right person.",
  },
};

export function StepBody({ step, playerId, me }: { step: StepId; playerId: Id<"players">; me: Me }) {
  if (step === "profile") return <ProfileForm playerId={playerId} me={me} />;
  if (step === "resume") return <ResumeUpload playerId={playerId} />;
  if (step === "draw") return <DrawEntry playerId={playerId} />;
  return <FollowUpForm playerId={playerId} me={me} />;
}
