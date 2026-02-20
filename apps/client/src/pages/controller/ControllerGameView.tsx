import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../../hooks/useSocket";
import { useRoomContext } from "../../context/RoomContext";
import { useGameStore } from "../../stores/gameStore";
import { useControllerInput } from "../../hooks/useControllerInput";
import { useWebRTC } from "../../hooks/useWebRTC";
import { getSocket } from "../../lib/socket";
import GameController from "../../components/controller/GameController";
import BowlingController from "../../components/controller/BowlingController";
import { useReconnect } from "../../hooks/useReconnect";

export default function ControllerGameView() {
  useSocket();
  useReconnect();
  const { roomId, gameId } = useParams<{ roomId: string; gameId: string }>();
  const navigate = useNavigate();
  const { state } = useRoomContext();
  const mySlot = useGameStore((s) => s.mySlot);
  const playerId = state.myPlayer?.id ?? getSocket().id ?? "";
  const isLeader = state.myPlayer?.isLeader ?? false;

  const isBowling = gameId === "bowling";

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exiting, setExiting] = useState(false);

  const { sendInput } = useControllerInput(roomId!, playerId, mySlot ?? 0);
  const { startStreaming, isStreaming } = useWebRTC(roomId!);

  // Navigate back to lobby when game ends
  useEffect(() => {
    if (!state.gameStarted) {
      navigate(`/play/${roomId}/lobby`, { replace: true });
    }
  }, [state.gameStarted, roomId, navigate]);

  // Start video streaming
  useEffect(() => {
    if (isStreaming) return;
    if (state.hostSocketIds.length > 0) {
      startStreaming(state.hostSocketIds);
    }
  }, [state.hostSocketIds, startStreaming, isStreaming]);

  const handleExitGame = useCallback(() => {
    setExiting(true);
    const socket = getSocket();
    socket.emit("exit_game", { roomId: roomId! }, (response) => {
      setExiting(false);
      if (!response.ok) {
        setShowExitConfirm(false);
      }
    });
  }, [roomId]);

  return (
    <div className="min-h-dvh bg-[#0f0a2e] relative overflow-hidden">
      {/* Player info bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-black/40 backdrop-blur-sm">
        <span className="text-white/80 text-sm font-medium">
          {state.myPlayer?.name ?? "Player"}
        </span>
        <div className="flex items-center gap-3">
          {isBowling ? (
            <span className="text-neon-300 text-xs font-mono">Bowling</span>
          ) : (
            <span className="text-neon-300 text-xs font-mono">
              Slot {mySlot ?? "?"}
            </span>
          )}
          {isLeader && (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-medium active:bg-red-500/40 transition-colors"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Game controller */}
      {isBowling ? (
        <BowlingController roomId={roomId!} />
      ) : (
        <GameController onInput={sendInput} />
      )}

      {/* Connection indicator */}
      <div className="absolute top-2 right-2 z-20">
        <div
          className={`w-2 h-2 rounded-full ${
            state.isConnected ? "bg-green-400" : "bg-red-400"
          }`}
        />
      </div>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1040] border border-white/10 rounded-2xl p-6 mx-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Exit Game?</h3>
            <p className="text-white/50 text-sm mb-6">
              This will end the game for all players and return everyone to the lobby.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium active:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExitGame}
                disabled={exiting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-bold active:bg-red-500/40 transition-colors disabled:opacity-50"
              >
                {exiting ? "Exiting..." : "Exit Game"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
