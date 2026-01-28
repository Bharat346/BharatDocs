import { motion } from "framer-motion";

export default function FeatureCard({ feature, index, theme }) {
  const Icon = feature.icon;
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div
        className={`
          relative h-full rounded-2xl p-8 border overflow-hidden
          transition-all duration-300
          ${isDark
            ? "bg-gray-900/80 border-gray-800 shadow-black/30"
            : "bg-white border-gray-200 shadow-gray-200"}
          shadow-md group-hover:shadow-lg
        `}
      >
        {/* Soft ambient glow (blue → green only) */}
        <div
          className={`
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
            transition-opacity duration-500 blur-xl
            ${isDark
              ? "bg-gradient-to-br from-blue-500/10 to-emerald-500/10"
              : "bg-gradient-to-br from-blue-400/20 to-emerald-400/20"}
          `}
        />

        {/* Icon */}
        <div
          className={`
            relative z-10 inline-flex p-4 rounded-xl mb-6
            transition-transform duration-300 group-hover:scale-105
            ${isDark
              ? "bg-blue-500/10 border border-blue-500/20"
              : "bg-blue-50"}
          `}
        >
          <Icon
            className={`
              w-7 h-7
              ${isDark ? "text-blue-400" : "text-blue-600"}
            `}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3
            className={`
              text-xl font-semibold mb-3
              ${isDark ? "text-gray-100" : "text-gray-900"}
            `}
          >
            {feature.title}
          </h3>

          <p
            className={`
              leading-relaxed
              ${isDark ? "text-gray-400" : "text-gray-600"}
            `}
          >
            {feature.description}
          </p>
        </div>

        {/* Bottom accent line */}
        <div
          className={`
            absolute bottom-0 left-1/2 -translate-x-1/2
            w-16 h-1 rounded-full overflow-hidden
            ${isDark ? "bg-gray-800" : "bg-gray-200"}
          `}
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            viewport={{ once: true }}
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
          />
        </div>

        {/* Subtle hover wash */}
        <div
          className={`
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            ${isDark
              ? "bg-white/5"
              : "bg-white/40"}
          `}
        />
      </div>
    </motion.div>
  );
}
