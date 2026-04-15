import { useState, useEffect, createContext, useContext } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import SignUpScreen from "@/pages/SignUpScreen";
import HomeScreen from "@/pages/HomeScreen";
import { Id } from "../convex/_generated/dataModel";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const PLAYER_ID_KEY = "pgc_player_id";

// Context so any component can read the current player id
export const PlayerContext = createContext<Id<"players"> | null>(null);
export const usePlayerId = () => useContext(PlayerContext);

function AppShell() {
  const [playerId, setPlayerId] = useState<Id<"players"> | null>(() => {
    const stored = localStorage.getItem(PLAYER_ID_KEY);
    return stored ? (stored as Id<"players">) : null;
  });

  useEffect(() => {
    if (playerId) {
      localStorage.setItem(PLAYER_ID_KEY, playerId);
    }
  }, [playerId]);

  if (!playerId) {
    return <SignUpScreen onRegistered={setPlayerId} />;
  }

  return (
    <PlayerContext.Provider value={playerId}>
      <HomeScreen />
    </PlayerContext.Provider>
  );
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <AppShell />
    </ConvexProvider>
  );
}
