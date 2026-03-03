import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Lobby } from "@/pages/Lobby";
import { Room } from "@/pages/Room";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSocketInit } from "@/hooks/useSocketInit";
import { useRoomListeners } from "@/hooks/useRoomListeners";
import { detectDevice } from "@/utils/device";

const isMobile = detectDevice() === "mobile";

function AppRoutes() {
  const { room } = useRoomStore();

  // When in a room, always show Room (controller or host view)
  if (room) {
    return (
      <Routes>
        <Route path="*" element={<Room />} />
      </Routes>
    );
  }

  // Mobile: skip landing page, go straight to join-focused lobby
  if (isMobile) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/lobby" replace />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/join/:code" element={<Lobby />} />
        <Route path="*" element={<Navigate to="/lobby" replace />} />
      </Routes>
    );
  }

  // Desktop: full routing with landing page
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/join/:code" element={<Lobby />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  useSocketInit();
  useRoomListeners();
  const { room } = useRoomStore();

  // Hide ConnectionStatus on mobile when in a room (controller is fullscreen)
  const showConnectionStatus = !(isMobile && room);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gamion-dark text-white font-display">
        <AppRoutes />
        {showConnectionStatus && <ConnectionStatus />}
      </div>
    </BrowserRouter>
  );
}

export default App;
