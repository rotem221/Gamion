import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useRoom } from "@/hooks/useRoom";
import { useRoomStore } from "@/stores/useRoomStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { useConnectionStore } from "@/stores/useConnectionStore";
import { detectDevice } from "@/utils/device";
import { motion } from "framer-motion";

const isMobile = detectDevice() === "mobile";

export function Lobby() {
  const { code: urlCode } = useParams<{ code: string }>();
  const [joinCode, setJoinCode] = useState(urlCode || "");
  const [guestNickname, setGuestNickname] = useState("");
  const { createRoom, joinRoom } = useRoom();
  const { error } = useRoomStore();
  const { isAuthenticated, user } = useAuthStore();
  const { isConnected } = useConnectionStore();
  const { logout } = useAuth();
  const nicknameRef = useRef<HTMLInputElement>(null);

  // Auto-focus nickname when coming from QR scan (/join/:code)
  useEffect(() => {
    if (urlCode && nicknameRef.current) {
      nicknameRef.current.focus();
    }
  }, [urlCode]);

  const handleCreate = () => {
    createRoom();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const nickname = isAuthenticated ? user!.nickname : guestNickname.trim();
    if (!nickname) return;
    joinRoom(joinCode, nickname);
  };

  // ─── Mobile layout (streamlined join-focused) ───
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gamion-primary to-gamion-secondary bg-clip-text text-transparent">
            Gamion
          </h1>
          <p className="text-gray-400 text-sm mt-1">Join with your phone</p>
        </motion.div>

        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-sm text-yellow-300 text-center"
          >
            Connecting to server...
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-300 text-center w-full max-w-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleJoin}
          className="w-full max-w-sm space-y-4"
        >
          {/* Room code */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
              Room Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0000"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={4}
              pattern="[0-9]{4}"
              required
              readOnly={!!urlCode}
              className={`w-full px-4 py-4 bg-gamion-surface rounded-xl border border-white/10 focus:border-gamion-primary focus:outline-none text-center text-3xl tracking-[0.4em] font-mono ${
                urlCode ? "text-gamion-primary opacity-80" : ""
              }`}
            />
          </div>

          {/* Nickname */}
          {!isAuthenticated ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
                Your Name
              </label>
              <input
                ref={nicknameRef}
                type="text"
                placeholder="Enter your name"
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                required
                maxLength={20}
                className="w-full px-4 py-4 bg-gamion-surface rounded-xl border border-white/10 focus:border-gamion-primary focus:outline-none text-center text-lg"
              />
            </div>
          ) : (
            <div className="text-center text-sm text-gray-400">
              Joining as{" "}
              <span className="text-white font-semibold">{user!.nickname}</span>
            </div>
          )}

          {/* Join button */}
          <button
            type="submit"
            disabled={!isConnected}
            className="w-full py-4 bg-gamion-primary rounded-xl font-bold text-lg text-white hover:bg-gamion-secondary transition-colors shadow-lg shadow-gamion-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Game
          </button>
        </motion.form>
      </div>
    );
  }

  // ─── Desktop layout (host + join) ───
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-4xl font-bold bg-gradient-to-r from-gamion-primary to-gamion-secondary bg-clip-text text-transparent"
      >
        Gamion Lobby
      </motion.h1>

      {isAuthenticated && (
        <p className="text-gray-400">
          Welcome,{" "}
          <span className="text-white font-semibold">{user!.nickname}</span>{" "}
          <button
            onClick={logout}
            className="text-sm text-gamion-primary hover:underline"
          >
            (logout)
          </button>
        </p>
      )}

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gamion-surface rounded-xl p-6 border border-white/10 w-72"
          >
            <h3 className="text-lg font-semibold mb-4">Host a Game</h3>
            <button
              onClick={handleCreate}
              className="w-full py-3 bg-gamion-primary rounded-lg font-semibold hover:bg-gamion-secondary transition-colors"
            >
              Create Room
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gamion-surface rounded-xl p-6 border border-white/10 w-72"
        >
          <h3 className="text-lg font-semibold mb-4">Join a Game</h3>
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              placeholder="4-digit code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={4}
              pattern="[0-9]{4}"
              required
              className="w-full px-4 py-3 bg-gamion-dark rounded-lg border border-white/10 focus:border-gamion-primary focus:outline-none text-center text-2xl tracking-[0.3em] font-mono"
            />
            {!isAuthenticated && (
              <input
                type="text"
                placeholder="Your nickname"
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gamion-dark rounded-lg border border-white/10 focus:border-gamion-primary focus:outline-none"
              />
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gamion-primary rounded-lg font-semibold hover:bg-gamion-secondary transition-colors"
            >
              Join Room
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
