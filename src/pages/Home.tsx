import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { BRAND } from "../branding";
import { levelTitle } from "../data/scoring";
import Board from "../components/Board";
import type { Me } from "../components/Capture";
import Play from "../components/Play";
import PoleExplorer from "../components/PoleExplorer";
import Rewards from "../components/Rewards";
import { PoleTag, cx } from "../components/ui";

type Tab = "play" | "pole" | "board" | "rewards";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "play", label: "Play", emoji: "⚡" },
  { id: "pole", label: "Explore", emoji: "🔍" },
  { id: "board", label: "Ranks", emoji: "🏆" },
  { id: "rewards", label: "Win", emoji: "🎁" },
];

export default function Home({ playerId, onSignOut }: { playerId: Id<"players">; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("play");
  const me = useQuery(api.players.me, { id: playerId }) as Me | null | undefined;

  // The stored id no longer matches a player (for example, data was cleared). Start over.
  useEffect(() => {
    if (me === null) onSignOut();
  }, [me, onSignOut]);

  if (!me) {
    return <p className="p-6 text-ink-soft">Loading your game.</p>;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-2 border-edge bg-sky px-4 py-2">
        <div className="min-w-0">
          <p className="font-display truncate text-[20px] font-bold leading-tight">{BRAND.appName}</p>
          <p className="truncate text-[14px] text-ink-soft">
            {me.name.split(" ")[0]}, level {me.level} {levelTitle(me.level).toLowerCase()}
          </p>
        </div>
        <PoleTag value={me.totalScore.toLocaleString()} label="points" />
      </header>

      <main className="flex-1 px-4 pb-28 pt-5">
        {tab === "play" && <Play playerId={playerId} me={me} onShowBoard={() => setTab("board")} />}
        {tab === "pole" && <PoleExplorer />}
        {tab === "board" && <Board playerId={playerId} me={me} />}
        {tab === "rewards" && <Rewards playerId={playerId} me={me} />}
      </main>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-edge bg-sheet pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto flex max-w-md">
          {TABS.map(({ id, label, emoji }) => {
            const on = tab === id;
            return (
              <li key={id} className="flex-1">
                <button
                  onClick={() => {
                    setTab(id);
                    window.scrollTo({ top: 0 });
                  }}
                  aria-current={on ? "page" : undefined}
                  className={cx(
                    "flex h-16 w-full flex-col items-center justify-center gap-0.5 text-[13px] font-semibold",
                    on ? "bg-hazard/15 text-hazard" : "text-ink-soft",
                  )}
                >
                  <span aria-hidden className={cx("text-[22px] leading-none transition-transform", on && "scale-125")}>
                    {emoji}
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
