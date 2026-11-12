// Recruiter view: #/recruiter
// Lists every lead with what they told us, and exports a CSV.

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BRAND } from "../branding";
import { Button, Field, Notice, cx } from "../components/ui";

interface Lead {
  name: string;
  email: string;
  phone: string;
  school: string;
  program: string;
  gradYear: string;
  lookingFor: string;
  roleInterest: string;
  linkedin: string;
  contactOptIn: boolean | null;
  totalScore: number;
  level: number;
  correctCount: number;
  answeredCount: number;
  bestStreak: number;
  resumeFilename: string;
  resumeUrl: string | null;
  drawCode: string;
  eventCode: string;
  source: string;
  consentVersion: string;
  consentAt: number | null;
  createdAt: number;
}

const KEY_STORAGE = "pgc_recruiter_key";

const iso = (ms: number | null) => (ms ? new Date(ms).toISOString() : "");
const accuracy = (l: Lead) => (l.answeredCount ? Math.round((l.correctCount / l.answeredCount) * 100) : null);

function toCsv(rows: Lead[]) {
  const cols: [string, (l: Lead) => string | number][] = [
    ["Name", (l) => l.name],
    ["Email", (l) => l.email],
    ["Phone", (l) => l.phone],
    ["School", (l) => l.school],
    ["Program", (l) => l.program],
    ["Graduating", (l) => l.gradYear],
    ["Looking for", (l) => l.lookingFor],
    ["Interested in", (l) => l.roleInterest],
    ["LinkedIn", (l) => l.linkedin],
    ["Follow-up", (l) => (l.contactOptIn === null ? "Not asked" : l.contactOptIn ? "Yes" : "No")],
    ["Score", (l) => l.totalScore],
    ["Questions answered", (l) => l.answeredCount],
    ["Accuracy %", (l) => accuracy(l) ?? ""],
    ["Best streak", (l) => l.bestStreak],
    ["Resume file", (l) => l.resumeFilename],
    ["Draw code", (l) => l.drawCode],
    ["Event", (l) => l.eventCode],
    ["Source", (l) => l.source],
    ["Consent version", (l) => l.consentVersion],
    ["Consent given (UTC)", (l) => iso(l.consentAt)],
    ["Signed up (UTC)", (l) => iso(l.createdAt)],
  ];
  const cell = (v: string | number) => {
    let s = String(v);
    // Stop spreadsheet apps from running a cell that starts like a formula.
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.map(([h]) => h).join(","), ...rows.map((l) => cols.map(([, f]) => cell(f(l))).join(","))].join("\n");
}

function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Recruiter() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) ?? "");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [resumeOnly, setResumeOnly] = useState(false);
  const [optInOnly, setOptInOnly] = useState(false);

  const data = useQuery(api.admin.leads, key ? { key } : "skip") as
    | { ok: false }
    | { ok: true; rows: Lead[]; capped: boolean }
    | undefined;

  const rows = useMemo(() => {
    if (!data?.ok) return [];
    const q = search.trim().toLowerCase();
    return data.rows.filter(
      (l) =>
        (!resumeOnly || l.resumeFilename) &&
        (!optInOnly || l.contactOptIn) &&
        (!q || [l.name, l.email, l.school, l.program, l.eventCode].some((f) => f.toLowerCase().includes(q))),
    );
  }, [data, search, resumeOnly, optInOnly]);

  if (!key || (data && !data.ok)) {
    return (
      <main className="mx-auto max-w-sm p-6">
        <h1 className="font-display text-[34px] font-bold">Recruiter view</h1>
        <p className="mt-1 text-ink-soft">Enter the passcode your event lead set up.</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            sessionStorage.setItem(KEY_STORAGE, draft);
            setKey(draft);
          }}
        >
          <Field label="Passcode" type="password" value={draft} onChange={(e) => setDraft(e.target.value)} />
          {key && data && !data.ok && <Notice tone="bad">That passcode didn't work.</Notice>}
          <Button type="submit" disabled={!draft}>
            Open leads
          </Button>
        </form>
      </main>
    );
  }

  if (!data) return <p className="p-6 text-ink-soft">Loading leads.</p>;

  const all = data.ok ? data.rows : [];
  const stats = [
    ["Sign-ups", all.length],
    ["Played", all.filter((l) => l.answeredCount > 0).length],
    ["Profiles", all.filter((l) => l.school && l.program).length],
    ["Résumés", all.filter((l) => l.resumeFilename).length],
    ["Want follow-up", all.filter((l) => l.contactOptIn).length],
  ] as const;

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-[18px] font-bold">{BRAND.appName}</p>
          <h1 className="font-display text-[38px] font-bold leading-none">Leads</h1>
        </div>
        <div className="flex gap-2">
          <Button
            block={false}
            onClick={() => download(`leads-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))}
            disabled={rows.length === 0}
          >
            Export {rows.length} to CSV
          </Button>
          <Button
            block={false}
            variant="secondary"
            onClick={() => {
              sessionStorage.removeItem(KEY_STORAGE);
              setKey("");
            }}
          >
            Lock
          </Button>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-xl border-2 border-edge bg-sheet px-3 py-2">
            <dd className="font-display tabular text-[32px] font-bold leading-none">{n}</dd>
            <dt className="text-[14px] text-ink-soft">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div className="min-w-56 flex-1">
          <Field
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, school, event"
          />
        </div>
        {(
          [
            ["Has résumé", resumeOnly, setResumeOnly],
            ["Wants follow-up", optInOnly, setOptInOnly],
          ] as const
        ).map(([label, on, set]) => (
          <label key={label} className="flex h-12 cursor-pointer items-center gap-2 font-medium">
            <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="size-5 accent-hazard" />
            {label}
          </label>
        ))}
      </div>

      {data.ok && data.capped && (
        <div className="mt-4">
          <Notice tone="info">Showing the top 500 by score. Export from the Convex dashboard for the full table.</Notice>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border-2 border-edge bg-sheet">
        <table className="w-full min-w-[860px] text-left text-[15px]">
          <thead className="border-b-2 border-edge">
            <tr>
              {["Name", "School and program", "Looking for", "Score", "Accuracy", "Résumé", "Follow-up", "Event"].map(
                (h) => (
                  <th key={h} className="px-3 py-2 font-semibold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.email + l.createdAt} className="border-b border-line align-top last:border-b-0">
                <td className="px-3 py-2">
                  <span className="block font-semibold">{l.name}</span>
                  <a className="underline" href={`mailto:${l.email}`}>
                    {l.email}
                  </a>
                  {l.phone && <span className="block text-ink-soft">{l.phone}</span>}
                </td>
                <td className="px-3 py-2">
                  {l.school || <span className="text-ink-soft">Not given</span>}
                  <span className="block text-ink-soft">{[l.program, l.gradYear].filter(Boolean).join(", ")}</span>
                </td>
                <td className="px-3 py-2">
                  {l.lookingFor}
                  <span className="block text-ink-soft">{l.roleInterest}</span>
                </td>
                <td className="tabular px-3 py-2 font-semibold">{l.totalScore.toLocaleString()}</td>
                <td className="tabular px-3 py-2">
                  {accuracy(l) === null ? "" : `${accuracy(l)}% of ${l.answeredCount}`}
                </td>
                <td className="px-3 py-2">
                  {l.resumeUrl ? (
                    <a className="underline" href={l.resumeUrl} target="_blank" rel="noreferrer">
                      {l.resumeFilename}
                    </a>
                  ) : (
                    l.resumeFilename
                  )}
                </td>
                <td
                  className={cx("px-3 py-2", l.contactOptIn && "font-semibold text-glass")}
                >
                  {l.contactOptIn === null ? "" : l.contactOptIn ? "Yes" : "No"}
                </td>
                <td className="px-3 py-2 text-ink-soft">{[l.eventCode, l.source].filter(Boolean).join(" / ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-ink-soft">No leads match. Clear the search or filters.</p>}
      </div>
    </main>
  );
}
