import { motion, AnimatePresence } from "framer-motion";
import type { RoomMember } from "@gamion/shared";

interface MemberListProps {
  members: RoomMember[];
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm text-gray-400 uppercase tracking-wide">
        Players ({members.length})
      </h3>
      <AnimatePresence>
        {members.map((member) => (
          <motion.div
            key={member.socketId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-3 p-3 bg-gamion-dark rounded-lg border border-white/5"
          >
            <div className="w-10 h-10 rounded-full bg-gamion-primary flex items-center justify-center font-bold text-sm">
              {member.nickname.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {member.nickname}
                {member.isLeader && (
                  <span className="ml-2 text-xs bg-gamion-secondary/30 text-gamion-secondary px-2 py-0.5 rounded-full">
                    Leader
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {member.role} / {member.deviceType}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
