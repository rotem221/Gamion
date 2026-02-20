import { motion } from "framer-motion";

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-6xl font-bold bg-gradient-to-r from-gamion-primary to-gamion-secondary bg-clip-text text-transparent"
      >
        Gamion
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 text-lg text-gray-400"
      >
        Real-time multiplayer gaming platform
      </motion.p>
    </div>
  );
}
