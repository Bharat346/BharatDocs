import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection({ theme, features }) {
  const isDark = theme === "dark";

  return (
    <section
      className={`
        relative py-24 overflow-hidden
        ${isDark
          ? "bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950"
          : "bg-gradient-to-b from-gray-50 via-white to-gray-50"}
      `}
    >
      <SectionBackground isDark={isDark} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader isDark={isDark} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================
   Background
========================= */
function SectionBackground({ isDark }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Subtle grid */}
      <div
        className={`
          absolute inset-0 bg-grid-white/[0.02] bg-grid-pattern
          ${isDark ? "opacity-10" : "opacity-20"}
        `}
      />

      {/* Vertical depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />

      {/* Blue glow */}
      <div
        className={`
          absolute -top-48 -right-48 h-[30rem] w-[30rem] rounded-full blur-3xl
          ${isDark ? "bg-blue-500/20" : "bg-blue-400/10"}
        `}
      />

      {/* Soft green glow */}
      <div
        className={`
          absolute -bottom-48 -left-48 h-[30rem] w-[30rem] rounded-full blur-3xl
          ${isDark ? "bg-emerald-500/15" : "bg-emerald-400/10"}
        `}
      />
    </div>
  );
}

/* =========================
   Header
========================= */
function SectionHeader({ isDark }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
      }}
      className="text-center mb-20"
    >
      {/* Badge */}
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`
          inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full
          bg-gradient-to-r from-blue-500/10 to-emerald-500/10
          border ${isDark ? "border-blue-500/10" : "border-blue-500/20"}
        `}
      >
        <div className="flex gap-1.5">
          <Circle className="w-2 h-2 fill-blue-500" />
          <Circle className="w-2 h-2 fill-blue-400" />
          <Circle className="w-2 h-2 fill-emerald-400" />
        </div>

        <span
          className={`
            text-xs sm:text-sm font-semibold tracking-wider
            ${isDark ? "text-gray-300" : "text-gray-600"}
          `}
        >
          ENTERPRISE-GRADE FEATURES
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h2
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.5 }}
        className={`
          text-4xl sm:text-5xl font-bold mb-6
          ${isDark ? "text-gray-100" : "text-gray-900"}
        `}
      >
        Built for{" "}
        <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
          Professional Excellence
        </span>
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`
          text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed
          ${isDark ? "text-gray-300" : "text-gray-600"}
        `}
      >
        Everything you need to organize, search, and collaborate on documents
        with enterprise-level performance and reliability.
      </motion.p>
    </motion.div>
  );
}
