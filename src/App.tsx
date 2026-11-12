import { useEffect, useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { Id } from "../convex/_generated/dataModel";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import BoothScreen from "./pages/BoothScreen";
import Recruiter from "./pages/Recruiter";
import { captureAttribution, getStoredPlayerId, storePlayerId } from "./lib/session";

const IS_DEMO = import.meta.env.VITE_DEMO === "1";
const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convex = IS_DEMO || convexUrl ? new ConvexReactClient(convexUrl ?? "") : null;

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash.replace(/^#\/?/, "");
}

function PlayerApp() {
  const [attribution] = useState(captureAttribution);
  const [playerId, setPlayerId] = useState<Id<"players"> | null>(
    () => getStoredPlayerId() as Id<"players"> | null,
  );

  function signIn(id: Id<"players"> | null) {
    storePlayerId(id);
    setPlayerId(id);
  }

  if (!playerId) return <Welcome attribution={attribution} onRegistered={signIn} />;
  return <Home playerId={playerId} onSignOut={() => signIn(null)} />;
}

export default function App() {
  const route = useHashRoute();

  if (!convex) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="font-display text-3xl font-bold">Backend not connected</h1>
        <p className="mt-2">
          Set VITE_CONVEX_URL to your Convex deployment, or run <code>npm run demo</code> to try the app with
          sample data stored in this browser.
        </p>
      </main>
    );
  }

  return (
    <ConvexProvider client={convex}>
      {IS_DEMO && (
        <div className="bg-hazard/15 px-3 py-1 text-center text-[13px] text-hazard">
          Demo mode. Sample players, and nothing leaves this device.
        </div>
      )}
      {route === "screen" ? <BoothScreen /> : route === "recruiter" ? <Recruiter /> : <PlayerApp />}
    </ConvexProvider>
  );
}
