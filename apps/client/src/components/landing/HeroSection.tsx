import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gamion-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-gamion-secondary/15 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-gamion-primary via-gamion-secondary to-gamion-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_4s_ease_infinite]">
          Gamion
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 mt-6 text-xl md:text-2xl text-gray-300 max-w-xl"
      >
        Your Phone is the Controller
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 mt-3 text-base text-gray-500 max-w-md"
      >
        Real-time multiplayer gaming platform. No downloads, no extra hardware —
        just a browser and your phone.
      </motion.p>

      {/* Phone → TV visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="relative z-10 mt-12 flex items-center gap-6"
      >
        {/* Phone icon */}
        <div className="w-16 h-28 md:w-20 md:h-36 rounded-xl border-2 border-gamion-primary/60 bg-gamion-surface/60 flex items-center justify-center">
          <span className="text-2xl md:text-3xl">📱</span>
        </div>

        {/* Arrow */}
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="flex items-center gap-1 text-gamion-primary"
        >
          <div className="w-12 h-0.5 bg-gamion-primary" />
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 12l-8 8V4z" />
          </svg>
        </motion.div>

        {/* TV icon */}
        <div className="w-32 h-24 md:w-44 md:h-32 rounded-lg border-2 border-gamion-secondary/60 bg-gamion-surface/60 flex items-center justify-center">
          <span className="text-3xl md:text-4xl">🖥️</span>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="relative z-10 mt-12 flex flex-col sm:flex-row gap-4"
      >
        {isAuthenticated ? (
          <button
            onClick={() => navigate("/lobby")}
            className="px-8 py-3 bg-gamion-primary rounded-lg font-semibold text-white hover:bg-gamion-secondary transition-colors shadow-lg shadow-gamion-primary/25"
          >
            Enter Lobby
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-gamion-primary rounded-lg font-semibold text-white hover:bg-gamion-secondary transition-colors shadow-lg shadow-gamion-primary/25"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/lobby")}
              className="px-8 py-3 bg-gamion-surface rounded-lg font-semibold border border-white/10 hover:border-gamion-primary transition-colors"
            >
              Join as Guest
            </button>
          </>
        )}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2 text-gray-600 text-xs"
        >
          <span>Scroll to explore</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 20l8-8H4z" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
