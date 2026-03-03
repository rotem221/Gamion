import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function CTASection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center bg-gradient-to-br from-gamion-primary/10 to-gamion-secondary/10 rounded-3xl p-12 border border-gamion-primary/20"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Ready to Play?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          Grab your friends, open a browser, and start a game in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(isAuthenticated ? "/lobby" : "/login")}
            className="px-10 py-4 bg-gamion-primary rounded-xl font-semibold text-lg text-white hover:bg-gamion-secondary transition-colors shadow-lg shadow-gamion-primary/25"
          >
            Host a Game
          </button>
          <button
            onClick={() => navigate("/lobby")}
            className="px-10 py-4 bg-gamion-surface rounded-xl font-semibold text-lg border border-white/10 hover:border-gamion-primary transition-colors"
          >
            Join a Room
          </button>
        </div>
      </motion.div>
    </section>
  );
}
