import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSocket } from "../../hooks/useSocket";
import { useRoom } from "../../hooks/useRoom";
import { useRoomContext } from "../../context/RoomContext";
import { useGameStore } from "../../stores/gameStore";
import { getSocket } from "../../lib/socket";
import { useReconnect } from "../../hooks/useReconnect";
import { useWebRTC } from "../../hooks/useWebRTC";
import DPad from "../../components/controller/DPad";
import WaitingView from "../../components/controller/WaitingView";
import NeonButton from "../../components/ui/NeonButton";
import CrownIcon from "../../components/ui/CrownIcon";

export default function ControllerLobby() {
  useSocket();
  useReconnect();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { state } = useRoomContext();
  const { navigateMenu, startGame } = useRoom();
  const { myPlayer, players, selectedGameId, gameStarted } = state;
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start video/audio streaming from lobby
  const { startStreaming, isStreaming, mediaError } = useWebRTC(roomId!);

  useEffect(() => {
    if (isStreaming) return;
    if (state.hostSocketIds.length > 0) {
      startStreaming(state.hostSocketIds);
    }
  }, [state.hostSocketIds, startStreaming, isStreaming]);

  // Redirect to join page if room no longer exists
  useEffect(() => {
    const socket = getSocket();
    const handleError = (msg: string) => {
      if (msg.toLowerCase().includes("room not found") || msg.toLowerCase().includes("room closed")) {
        navigate("/join", { replace: true });
      }
    };
    socket.on("error", handleError);
    return () => { socket.off("error", handleError); };
  }, [navigate]);

  // Navigate to game view when game starts
  useEffect(() => {
    if (gameStarted && selectedGameId && roomId && myPlayer) {
      const slotAssignments = state.slotAssignments;
      if (slotAssignments && myPlayer.id in slotAssignments) {
        useGameStore.getState().setMySlot(slotAssignments[myPlayer.id]);
      }
      navigate(`/play/${roomId}/game/${selectedGameId}`);
    }
  }, [gameStarted, selectedGameId, roomId, myPlayer, state.slotAssignments, navigate]);

  const handleStartGame = async () => {
    setIsStarting(true);
    setError(null);
    try {
      await startGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
    } finally {
      setIsStarting(false);
    }
  };

  if (!myPlayer) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-neon-300/60">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          {myPlayer.isLeader && <CrownIcon size={24} />}
          {myPlayer.name}
        </h2>
        <p className="text-neon-400/60 text-sm mt-1">
          {myPlayer.isLeader ? "You are the leader" : "Player"}
        </p>
        {/* Camera/mic status */}
        <p className="text-xs mt-2">
          {isStreaming ? (
            <span className="text-green-400/60">Camera &amp; mic active</span>
          ) : mediaError ? (
            <span className="text-red-400/60">{mediaError}</span>
          ) : (
            <span className="text-white/30 animate-pulse">Connecting camera...</span>
          )}
        </p>
      </motion.div>

      <div className="flex-1 flex items-center justify-center w-full">
        {myPlayer.isLeader ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-neon-300/80 text-sm text-center">
              Use the D-Pad to navigate the game menu
            </p>
            <DPad onPress={navigateMenu} />

            {selectedGameId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <NeonButton
                  size="lg"
                  onClick={handleStartGame}
                  disabled={isStarting}
                  className="w-full"
                >
                  {isStarting ? "Starting..." : "Start Game!"}
                </NeonButton>
              </motion.div>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </motion.div>
        ) : (
          <WaitingView players={players} myPlayer={myPlayer} />
        )}
      </div>
    </div>
  );
}
