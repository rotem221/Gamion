import { motion } from "framer-motion";

const features = [
  {
    title: "Real-time Controls",
    description:
      "Sub-50ms input latency via WebSocket. Every button press feels instant, just like a real controller.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "QR Code Join",
    description:
      "No signup required for players. Scan the QR code, pick a nickname, and you're in. Zero friction.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="3" height="3" />
        <rect x="18" y="18" width="3" height="3" />
      </svg>
    ),
  },
  {
    title: "Cross-Device",
    description:
      "Desktop, tablet, or Smart TV as the main screen. Any smartphone as a controller. Mix and match.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: "WebRTC Streaming",
    description:
      "Coming soon — peer-to-peer video streaming for ultra-low latency game rendering across devices.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    comingSoon: true,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Features</h2>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Built for speed, simplicity, and fun
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={itemVariants}
            className="relative bg-gamion-surface/60 rounded-2xl p-6 border border-white/5 hover:border-gamion-primary/30 transition-colors group"
          >
            {f.comingSoon && (
              <span className="absolute top-4 right-4 text-[10px] font-medium uppercase tracking-wider text-gamion-secondary bg-gamion-secondary/10 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
            <div className="w-12 h-12 rounded-xl bg-gamion-primary/10 text-gamion-primary flex items-center justify-center mb-4 group-hover:bg-gamion-primary/20 transition-colors">
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {f.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
