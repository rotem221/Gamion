import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { RoomProvider } from "./context/RoomContext";
import HostLanding from "./pages/host/HostLanding";
import HostLobby from "./pages/host/HostLobby";
import ControllerLanding from "./pages/controller/ControllerLanding";
import ControllerJoin from "./pages/controller/ControllerJoin";
import ControllerLobby from "./pages/controller/ControllerLobby";

// Lazy load game views (heavy 3D dependencies)
const GameView = lazy(() => import("./pages/host/GameView"));
const ControllerGameView = lazy(() => import("./pages/controller/ControllerGameView"));

function GameLoading() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0f0a2e]">
      <p className="text-neon-300 text-lg animate-pulse">Loading game...</p>
    </div>
  );
}

export default function App() {
  return (
    <RoomProvider>
      <Suspense fallback={<GameLoading />}>
        <Routes>
          {/* Host routes */}
          <Route path="/" element={<HostLanding />} />
          <Route path="/host/:roomId" element={<HostLobby />} />
          <Route path="/host/:roomId/game/:gameId" element={<GameView />} />

          {/* Controller routes */}
          <Route path="/join" element={<ControllerLanding />} />
          <Route path="/play/:roomId" element={<ControllerJoin />} />
          <Route path="/play/:roomId/lobby" element={<ControllerLobby />} />
          <Route path="/play/:roomId/game/:gameId" element={<ControllerGameView />} />
        </Routes>
      </Suspense>
    </RoomProvider>
  );
}
