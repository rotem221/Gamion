import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NeonButton from "../../components/ui/NeonButton";
import GlassCard from "../../components/ui/GlassCard";
import { useSocket } from "../../hooks/useSocket";
import { useRoom } from "../../hooks/useRoom";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function HostLanding() {
  useSocket();
  const navigate = useNavigate();
  const { createRoom } = useRoom();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resume session if roomId exists in sessionStorage
  useEffect(() => {
    const savedRoomId = sessionStorage.getItem("gameion_host_roomId");
    if (savedRoomId) {
      navigate(`/host/${savedRoomId}`, { replace: true });
    }
  }, [navigate]);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const roomId = await createRoom();
      sessionStorage.setItem("gameion_host_roomId", roomId);
      navigate(`/host/${roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <span className="text-xl font-bold bg-gradient-to-r from-neon-300 to-neon-500 bg-clip-text text-transparent">
            GAMEION
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-neon-300/60 hover:text-neon-300 text-sm transition-colors">
            How It Works
          </a>
          <a href="#games" className="text-neon-300/60 hover:text-neon-300 text-sm transition-colors">
            Games
          </a>
          <a href="#features" className="text-neon-300/60 hover:text-neon-300 text-sm transition-colors">
            Features
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-700/15 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center mb-6 relative z-10"
        >
          <div className="text-6xl mb-6">🎮</div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-neon-200 via-neon-400 to-neon-500 bg-clip-text text-transparent">
              GAMEION
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-neon-300/80 max-w-xl mx-auto leading-relaxed">
            Turn your TV into a game console.
            <br />
            <span className="text-neon-400/60">Your phone is the controller.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center gap-4 relative z-10"
        >
          <NeonButton
            size="lg"
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="text-xl px-10 py-5"
          >
            {isCreating ? "Creating Room..." : "Create Room"}
          </NeonButton>

          <p className="text-neon-400/40 text-sm">
            No downloads. No sign-ups. Just play.
          </p>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20 relative">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            className="text-3xl font-bold text-center mb-4"
          >
            <span className="bg-gradient-to-r from-neon-300 to-neon-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </motion.h2>
          <p className="text-neon-300/50 text-center mb-12 max-w-lg mx-auto">
            Get started in 3 simple steps. No apps to install, everything runs in the browser.
          </p>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                step: "1",
                icon: "🖥️",
                title: "Open on Your TV",
                desc: "Open Gameion on your desktop or smart TV browser. Click 'Create Room' to get a unique room code.",
              },
              {
                step: "2",
                icon: "📱",
                title: "Scan & Connect",
                desc: "Players scan the QR code with their phones. Enter a name, pick an avatar, and join instantly.",
              },
              {
                step: "3",
                icon: "🕹️",
                title: "Play Together",
                desc: "The leader picks a game using their phone as a remote. Everyone's phone becomes their personal controller.",
              },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp}>
                <GlassCard className="p-6 text-center h-full relative overflow-hidden">
                  <div className="absolute top-3 right-4 text-5xl font-black text-neon-500/10">
                    {item.step}
                  </div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-neon-300/60 text-sm leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Games Showcase */}
      <section id="games" className="px-6 py-20 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            className="text-3xl font-bold text-center mb-4"
          >
            <span className="bg-gradient-to-r from-neon-300 to-neon-400 bg-clip-text text-transparent">
              Available Games
            </span>
          </motion.h2>
          <p className="text-neon-300/50 text-center mb-12 max-w-lg mx-auto">
            Choose from our growing collection of multiplayer experiences.
          </p>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeUp}>
              <GlassCard className="p-8 h-full border-neon-500/20 hover:border-neon-400/40 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">⚔️</span>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Co-op Quest</h3>
                    <span className="inline-block bg-neon-500/20 text-neon-300 text-xs px-2 py-0.5 rounded-full mb-3">
                      2 Players
                    </span>
                    <p className="text-neon-300/60 text-sm leading-relaxed">
                      A cooperative side-scrolling adventure where teamwork is everything.
                      Solve puzzles together — one player's actions unlock paths for the other.
                      Coordinate through voice chat to overcome challenges.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={fadeUp}>
              <GlassCard className="p-8 h-full border-neon-500/20 hover:border-neon-400/40 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">🎳</span>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Cosmic Bowling</h3>
                    <span className="inline-block bg-neon-500/20 text-neon-300 text-xs px-2 py-0.5 rounded-full mb-3">
                      1-8 Players
                    </span>
                    <p className="text-neon-300/60 text-sm leading-relaxed">
                      Step up to the lane in a stunning 3D bowling alley.
                      Swipe your phone to aim and throw — realistic physics make every pin count.
                      Take turns and compete for the highest score.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            className="text-3xl font-bold text-center mb-4"
          >
            <span className="bg-gradient-to-r from-neon-300 to-neon-400 bg-clip-text text-transparent">
              Platform Features
            </span>
          </motion.h2>
          <p className="text-neon-300/50 text-center mb-12 max-w-lg mx-auto">
            Built for seamless local multiplayer on any device.
          </p>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              {
                icon: "📱",
                title: "Phone as Controller",
                desc: "Your phone becomes a D-Pad, swipe controller, or button pad — adapting to each game automatically.",
              },
              {
                icon: "🔗",
                title: "Instant Connection",
                desc: "Scan a QR code and you're in. No apps, no accounts, no friction. Works on any modern browser.",
              },
              {
                icon: "🎥",
                title: "Video Chat Bubbles",
                desc: "Turn on your camera and appear as a floating bubble on the main screen. See each other while you play.",
              },
              {
                icon: "👑",
                title: "Leader System",
                desc: "The first player to join becomes the leader. They navigate the menu and pick the game for everyone.",
              },
              {
                icon: "🌐",
                title: "Local Network",
                desc: "Everything stays on your local WiFi. Low latency, no servers needed, and your data never leaves your home.",
              },
              {
                icon: "🎨",
                title: "Gorgeous 3D Games",
                desc: "Powered by React Three Fiber and Rapier physics. Console-quality graphics right in the browser.",
              },
            ].map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <GlassCard className="p-5 h-full">
                  <div className="text-2xl mb-3">{feature.icon}</div>
                  <h3 className="text-base font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-neon-300/60 text-xs leading-relaxed">{feature.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-neon-500/5 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center relative z-10"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-neon-300/60 mb-8">
            Create a room and invite your friends. It takes less than 10 seconds.
          </p>
          <NeonButton
            size="lg"
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="text-lg px-8 py-4"
          >
            {isCreating ? "Creating..." : "Create Room Now"}
          </NeonButton>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎮</span>
            <span className="text-sm font-bold bg-gradient-to-r from-neon-300 to-neon-500 bg-clip-text text-transparent">
              GAMEION
            </span>
          </div>
          <p className="text-neon-400/30 text-xs">
            Local multiplayer gaming platform. Play together on any device.
          </p>
        </div>
      </footer>
    </div>
  );
}
