import { useCallback } from "react";
import { useRoomStore } from "@/stores/useRoomStore";
import { useRoom } from "@/hooks/useRoom";
import { useControllerInput } from "@/hooks/useControllerInput";
import { socket } from "@/utils/socket";
import { QRCode } from "@/components/QRCode";
import { MemberList } from "@/components/MemberList";
import { ControllerLayout } from "@/components/controller";
import { motion } from "framer-motion";
import type { ControllerInputSyncPayload } from "@gamion/shared";

export function Room() {
  const { room, myRole, isLeader } = useRoomStore();
  const { leaveRoom } = useRoom();

  const handleInputReceived = useCallback(
    (data: ControllerInputSyncPayload) => {
      console.log(
        `[Controller Input] ${data.fromNickname}: ${data.button} ${data.action}`
      );
    },
    []
  );

  useControllerInput(
    myRole === "host" || myRole === "remote" ? handleInputReceived : undefined
  );

  if (!room) return null;

  const me = room.members.find((m) => m.socketId === socket.id);

  if (myRole === "controller") {
    return (
      <ControllerLayout
        playerName={me?.nickname ?? "Player"}
        roomCode={room.code}
        isLeader={isLeader}
        onLeave={leaveRoom}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-2">Room</h2>
        <span className="text-5xl font-mono font-bold tracking-[0.3em] text-gamion-primary">
          {room.code}
        </span>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gamion-surface rounded-xl p-6 border border-white/10 text-center"
        >
          <p className="text-sm text-gray-400 mb-3">Scan to join</p>
          <QRCode roomCode={room.code} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gamion-surface rounded-xl p-6 border border-white/10 min-w-[280px]"
        >
          <MemberList members={room.members} />
        </motion.div>
      </div>

      {myRole === "host" && isLeader && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gamion-surface rounded-xl p-8 border border-white/10 text-center w-full max-w-2xl"
        >
          <p className="text-gray-500">Game carousel placeholder</p>
        </motion.div>
      )}

      <button
        onClick={leaveRoom}
        className="text-sm text-red-400 hover:text-red-300"
      >
        Leave Room
      </button>
    </div>
  );
}
