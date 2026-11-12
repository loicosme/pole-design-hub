// Put this on the booth TV or tablet: #/screen
// It shows the QR code and the live board. Add ?e=your-event to tag sign-ups.

import { useQuery } from "convex/react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../../convex/_generated/api";
import { BRAND, RESUME_UNLOCK_THRESHOLD } from "../branding";
import { BoardList, type BoardRow } from "../components/Board";

function joinUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  const event = url.searchParams.get("e") ?? url.searchParams.get("event");
  url.search = "";
  if (event) url.searchParams.set("e", event);
  url.searchParams.set("src", "screen");
  return url.toString();
}

export default function BoothScreen() {
  const rows = useQuery(api.leaderboard.top, { limit: 8 }) as BoardRow[] | undefined;
  const url = joinUrl();

  return (
    <main className="grid min-h-dvh gap-8 p-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:p-12">
      <section className="flex flex-col justify-center">
        <p className="font-display text-[28px] font-bold">{BRAND.appName}</p>
        <h1 className="font-display mt-2 text-[clamp(44px,6vw,92px)] font-bold leading-[0.92]">{BRAND.headline}</h1>
        <div className="mt-8 flex items-center gap-6">
          <div className="rounded-md border-4 border-ink bg-sheet p-3">
            <QRCodeSVG value={url} size={220} fgColor="#0f1b2d" bgColor="#fbfcfd" level="M" />
          </div>
          <p className="max-w-[16ch] text-[clamp(20px,2vw,30px)] font-semibold leading-tight">
            Scan to play. {RESUME_UNLOCK_THRESHOLD} points opens résumé drop-off.
          </p>
        </div>
      </section>

      <section className="flex flex-col justify-center">
        <h2 className="font-display text-[40px] font-bold">The board</h2>
        <div className="mt-2 rounded-md border-4 border-ink bg-sheet">
          {rows && rows.length > 0 ? (
            <BoardList rows={rows} large />
          ) : (
            <p className="p-8 text-[24px] text-ink-soft">Nobody has scored yet. First place is open.</p>
          )}
        </div>
      </section>
    </main>
  );
}
