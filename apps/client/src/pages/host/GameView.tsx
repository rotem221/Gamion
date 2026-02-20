import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import { useRoomContext } from "../../context/RoomContext";
import { useRemoteStreams } from "../../hooks/useRemoteStreams";
import { getSocket } from "../../lib/socket";
import GameCanvas from "../../components/game/GameCanvas";
import GameErrorBoundary from "../../components/ui/GameErrorBoundary";
import GameSidebar from "../../components/game/GameSidebar";
import BowlingScoreboard from "../../components/host/BowlingScoreboard";
import { useBowlingStore } from "../../stores/bowlingStore";

export default function GameView() {
  useSocket();
  const { roomId, gameId } = useParams<{ roomId: string; gameId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useRoomContext();
  const streams = useRemoteStreams(roomId!);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const bowlingState = useBowlingStore((s) => s.gameState);

  const isBowling = gameId === "bowling";

  // Navigate back to lobby when game ends
  useEffect(() => {
    if (!state.gameStarted && ready) {
      navigate(`/host/${roomId}`, { replace: true });
    }
  }, [state.gameStarted, ready, roomId, navigate]);

  // Rejoin the Socket.io room so we receive broadcasts
  useEffect(() => {
    if (!roomId || ready) return;

    const socket = getSocket();

    const timeout = setTimeout(() => {
      if (!ready) {
        setLoadError("Connection timed out. The room may no longer exist.");
      }
    }, 8000);

    const doRejoin = () => {
      socket.emit("host_rejoin", { roomId }, (response) => {
        clearTimeout(timeout);
        if (response.ok) {
          dispatch({ type: "SET_ROOM_STATE", payload: response.room });
          setReady(true);
        } else {
          setLoadError("Room is no longer available.");
        }
      });
    };

    if (socket.connected) {
      doRejoin();
    } else {
      socket.once("connect", doRejoin);
    }

    return () => clearTimeout(timeout);
  }, [roomId, ready, dispatch, navigate]);

  // Current turn info for bowling
  const currentPlayerName = (() => {
    if (!isBowling || !bowlingState) return null;
    const pid = bowlingState.turnOrder[bowlingState.currentPlayerIndex];
    return bowlingState.scores.find((s) => s.playerId === pid)?.playerName ?? "Player";
  })();

  if (loadError) {
    return (
      <div className="w-screen h-dvh bg-[#0f0a2e] flex flex-col items-center justify-center text-center px-6">
        <div className="text-5xl mb-4">&#9888;&#65039;</div>
        <h2 className="text-xl font-bold text-white mb-2">Failed to load game</h2>
        <p className="text-white/50 text-sm mb-6">{loadError}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-neon-500/20 border border-neon-400/50 text-neon-200 text-sm font-medium hover:bg-neon-500/30 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("gameion_host_roomId");
              navigate("/", { replace: true });
            }}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-dvh bg-[#0f0a2e] overflow-hidden relative">
      {ready ? (
        <GameErrorBoundary>
          <GameCanvas gameId={gameId!} roomId={roomId!} />
        </GameErrorBoundary>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-neon-300 text-lg animate-pulse">Loading game...</p>
        </div>
      )}

      {/* Bowling overlays */}
      {isBowling && bowlingState && (
        <>
          {bowlingState.phase === "waiting" && currentPlayerName && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-neon-accent/30">
              <span className="text-neon-300 text-sm font-medium">
                {currentPlayerName}&apos;s turn
              </span>
              <span className="text-white/40 text-xs ml-2">
                Frame {bowlingState.currentFrame + 1}
              </span>
            </div>
          )}

          {(bowlingState.phase === "rolling" || bowlingState.phase === "settling") && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-500/20 backdrop-blur-md px-6 py-2 rounded-full border border-yellow-500/30">
              <span className="text-yellow-300 text-sm font-medium animate-pulse">
                {bowlingState.phase === "rolling" ? "Rolling..." : "Settling..."}
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 max-h-[35vh] overflow-auto">
            <BowlingScoreboard />
          </div>
        </>
      )}

      {/* Participant sidebar with video bubbles */}
      <GameSidebar
        players={state.players}
        streams={streams}
        roomId={roomId!}
      />
    </div>
  );
}
