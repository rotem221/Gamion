import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "../../components/ui/GlassCard";
import NeonButton from "../../components/ui/NeonButton";
import AvatarPicker from "../../components/controller/AvatarPicker";
import { useSocket } from "../../hooks/useSocket";
import { useRoom } from "../../hooks/useRoom";
import { useRoomContext } from "../../context/RoomContext";
import { saveSession } from "../../hooks/useReconnect";
import { getSocket } from "../../lib/socket";

export default function ControllerJoin() {
  useSocket();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { joinRoom } = useRoom();
  const { dispatch } = useRoomContext();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("robot");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check room existence on mount
  useEffect(() => {
    if (!roomId) { setChecking(false); return; }
    const socket = getSocket();
    const check = () => {
      socket.emit("check_room", { roomId }, (response: { ok: boolean }) => {
        if (!response.ok) {
          setExpired(true);
        }
        setChecking(false);
      });
    };
    if (socket.connected) check();
    else socket.once("connect", check);
  }, [roomId]);

  const handleJoin = async () => {
    if (!roomId || !name.trim()) return;

    setIsJoining(true);
    setError(null);
    try {
      const { player, token } = await joinRoom(roomId, name.trim(), avatar);
      dispatch({ type: "SET_MY_PLAYER", payload: player });
      saveSession(roomId, player.id, token, name.trim(), avatar);
      navigate(`/play/${roomId}/lobby`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to join room";
      if (msg === "Room not found") {
        setExpired(true);
        return;
      }
      setError(msg);
    } finally {
      setIsJoining(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-neon-300/60 animate-pulse">Checking room...</p>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">&#9203;</div>
          <h2 className="text-2xl font-bold text-white mb-2">Link Expired</h2>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            This room is no longer available.<br />
            Ask the host for a new code or scan a new QR.
          </p>
          <NeonButton onClick={() => navigate("/join", { replace: true })} className="w-56">
            Back to Join Page
          </NeonButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-300 to-neon-500 bg-clip-text text-transparent">
          GAMEION
        </h1>
        <p className="text-neon-300/60 text-sm mt-1">
          Room: <span className="font-mono font-bold text-neon-300">{roomId}</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xs"
      >
        <GlassCard className="p-6 flex flex-col gap-6">
          <div>
            <label className="text-neon-300/80 text-sm mb-2 block">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 12))}
              placeholder="Enter your name"
              maxLength={12}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-neon-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-neon-300/80 text-sm mb-2 block">
              Choose Avatar
            </label>
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
          </div>

          <NeonButton
            onClick={handleJoin}
            disabled={!name.trim() || isJoining}
            className="w-full"
          >
            {isJoining ? "Joining..." : "Join Game"}
          </NeonButton>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
