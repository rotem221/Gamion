import { motion } from "framer-motion";

const games = [
  {
    title: "Co-op Quest",
    genre: "Platformer",
    players: "2-4 Players",
    description:
      "Team up for a side-scrolling adventure. Navigate obstacles, collect treasures, and defeat bosses together. Each player controls a unique hero with special abilities.",
    color: "from-indigo-500 to-purple-600",
    tags: ["Co-op", "Adventure", "Puzzle"],
  },
  {
    title: "Strike Arena",
    genre: "Bowling",
    players: "2-6 Players",
    description:
      "Competitive bowling with a twist. Swipe your phone to throw, curve, and spin the ball. Unlock power-ups and challenge friends to become the strike champion.",
    color: "from-amber-500 to-orange-600",
    tags: ["Competitive", "Sports", "Party"],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.25 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

export function GamesShowcase() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Games</h2>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Launching with two party games — more coming soon
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {games.map((game) => (
          <motion.div
            key={game.title}
            variants={cardVariants}
            className="group relative bg-gamion-surface/60 rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-colors"
          >
            {/* Gradient header */}
            <div
              className={`h-40 bg-gradient-to-br ${game.color} flex items-center justify-center`}
            >
              <span className="text-5xl font-bold text-white/90">
                {game.title}
              </span>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gamion-primary font-medium">
                  {game.genre}
                </span>
                <span className="text-xs text-gray-500 bg-gamion-dark/50 px-2 py-1 rounded">
                  {game.players}
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {game.description}
              </p>
              <div className="flex gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-gamion-dark/60 text-gray-400 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
