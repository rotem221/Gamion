import { useConnectionStore } from "@/stores/useConnectionStore";
import { useSocket } from "@/hooks/useSocket";
import { motion } from "framer-motion";

export function ConnectionStatus() {
  const { isConnected, latency } = useConnectionStore();
  const { sendPing } = useSocket();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-gamion-surface rounded-lg p-4 shadow-lg border border-white/10"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {latency !== null && (
        <p className="text-xs text-gray-400">Latency: {latency}ms</p>
      )}

      <button
        onClick={sendPing}
        disabled={!isConnected}
        className="mt-2 px-3 py-1 text-xs bg-gamion-primary rounded hover:bg-gamion-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Send Ping
      </button>
    </motion.div>
  );
}
