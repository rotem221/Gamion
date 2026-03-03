import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Create a Room",
    description:
      "Host opens Gamion on a desktop or TV browser. A unique room code and QR code are generated instantly.",
    icon: "🏠",
  },
  {
    step: "02",
    title: "Scan & Join",
    description:
      "Players scan the QR code or enter the room code on their phones. No app download needed.",
    icon: "📲",
  },
  {
    step: "03",
    title: "Play Together",
    description:
      "Phones become controllers with D-Pad and buttons. The main screen shows the game in real time.",
    icon: "🎮",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Three simple steps to start playing
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {steps.map((s) => (
          <motion.div
            key={s.step}
            variants={itemVariants}
            className="relative bg-gamion-surface/60 rounded-2xl p-8 border border-white/5 text-center group hover:border-gamion-primary/30 transition-colors"
          >
            <span className="absolute top-4 right-4 text-xs font-mono text-gamion-primary/40">
              {s.step}
            </span>
            <div className="text-5xl mb-6">{s.icon}</div>
            <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {s.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
