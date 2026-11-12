import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { DRAW, PROFILE_BONUS, RESUME_UNLOCK_THRESHOLD } from "../branding";
import { DrawEntry, FollowUpForm, ProfileForm, ResumeUpload, type Me } from "./Capture";
import { Sheet, cx } from "./ui";

function Step({
  title,
  status,
  done,
  locked,
  children,
}: {
  title: string;
  status: string;
  done: boolean;
  locked?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Sheet muted={locked}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className={cx("font-display text-[22px] font-semibold leading-tight", locked && "text-ink-soft")}>
          {title}
        </h2>
        <span
          className={cx(
            "shrink-0 rounded-sm px-2 py-0.5 text-[13px] font-semibold",
            done ? "bg-glass text-sheet" : locked ? "bg-steel text-ink-soft" : "bg-hazard text-ink",
          )}
        >
          {status}
        </span>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </Sheet>
  );
}

export default function Rewards({ playerId, me }: { playerId: Id<"players">; me: Me }) {
  const resume = useQuery(api.resumes.getByPlayer, { playerId });
  const entry = useQuery(api.draw.mine, { playerId });
  const unlocked = me.totalScore >= RESUME_UNLOCK_THRESHOLD;
  const toGo = RESUME_UNLOCK_THRESHOLD - me.totalScore;
  const lockedStatus = `${toGo} points to go`;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-[34px] font-bold leading-none">Rewards</h1>
        <p className="mt-1 text-ink-soft">What your points open up.</p>
      </header>

      <Step
        title="Your profile"
        done={me.profileComplete}
        status={me.profileComplete ? "Done" : `Worth ${PROFILE_BONUS} points`}
      >
        <ProfileForm playerId={playerId} me={me} />
      </Step>

      <Step
        title="Résumé drop-off"
        done={Boolean(resume)}
        locked={!unlocked}
        status={resume ? "Sent" : unlocked ? "Open" : lockedStatus}
      >
        {unlocked ? (
          <ResumeUpload playerId={playerId} />
        ) : (
          <p className="text-[15px] text-ink-soft">
            Opens at {RESUME_UNLOCK_THRESHOLD} points. Your résumé reaches the engineers with your score attached.
          </p>
        )}
      </Step>

      {DRAW.enabled && (
        <Step
          title={DRAW.title}
          done={Boolean(entry)}
          locked={!unlocked}
          status={entry ? "Entered" : unlocked ? "Open" : lockedStatus}
        >
          <p className="mb-3 text-[15px] text-ink-soft">
            {DRAW.prize}. {DRAW.closes}.
          </p>
          {unlocked && <DrawEntry playerId={playerId} />}
        </Step>
      )}

      <Step
        title="Follow-up after the event"
        done={me.followUpAnswered && me.contactOptIn}
        status={me.followUpAnswered ? (me.contactOptIn ? "Yes" : "No") : "Your call"}
      >
        <FollowUpForm playerId={playerId} me={me} />
      </Step>
    </div>
  );
}
