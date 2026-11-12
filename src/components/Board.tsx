import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { levelTitle } from "../data/scoring";
import type { Me } from "./Capture";
import { PoleTag, Sheet, cx } from "./ui";

export interface BoardRow {
  rank: number;
  name: string;
  school: string;
  totalScore: number;
  level: number;
  isMe: boolean;
}

export function BoardList({ rows, large = false }: { rows: BoardRow[]; large?: boolean }) {
  return (
    <ol>
      {rows.map((r) => (
        <li
          key={r.rank}
          className={cx(
            "flex items-center gap-3 border-b border-line px-4 last:border-b-0",
            large ? "py-3" : "min-h-14 py-2",
            r.isMe && "bg-hazard/35",
          )}
        >
          <span className={cx("font-display tabular w-8 font-bold", large ? "text-[34px]" : "text-[24px]")}>
            {r.rank}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cx("block truncate font-semibold", large && "text-[24px]")}>
              {r.name}
              {r.isMe && " (you)"}
            </span>
            <span className={cx("block truncate text-ink-soft", large ? "text-[17px]" : "text-[14px]")}>
              {levelTitle(r.level)}
              {r.school && `, ${r.school}`}
            </span>
          </span>
          <span className={cx("font-display tabular font-bold", large ? "text-[34px]" : "text-[24px]")}>
            {r.totalScore.toLocaleString()}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function Board({ playerId, me }: { playerId: Id<"players">; me: Me }) {
  const rows = useQuery(api.leaderboard.top, { playerId }) as BoardRow[] | undefined;
  const rank = useQuery(api.leaderboard.rank, { playerId });
  const onBoard = rows?.some((r) => r.isMe);
  const next = rows && rank ? rows.filter((r) => r.rank < rank.rank).at(-1) : undefined;

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[34px] font-bold leading-none">The board</h1>
          <p className="mt-1 text-ink-soft">
            {me.totalScore === 0
              ? "Play a round to get on it."
              : next
                ? `${(next.totalScore - me.totalScore + 1).toLocaleString()} points to pass ${next.name.replace(/\.$/, "")}.`
                : rank?.rank === 1
                  ? "You're on top. Stay there."
                  : "Updates live as people play."}
          </p>
        </div>
        {rank && me.totalScore > 0 && (
          <PoleTag value={`${rank.rank}${rank.capped ? "+" : ""}`} label="your rank" tone="hazard" size="lg" />
        )}
      </header>

      <Sheet pad="p-0">
        {rows === undefined ? (
          <p className="px-4 py-6 text-ink-soft">Loading the board.</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-ink-soft">Nobody has scored yet. The first round played takes first place.</p>
        ) : (
          <BoardList rows={rows} />
        )}
      </Sheet>

      {rows && rows.length > 0 && !onBoard && me.totalScore > 0 && (
        <p className="text-[15px] text-ink-soft">
          You're outside the top {rows.length} with {me.totalScore.toLocaleString()} points.
        </p>
      )}
      <p className="text-[14px] text-ink-soft">Other players see your first name and last initial only.</p>
    </div>
  );
}
