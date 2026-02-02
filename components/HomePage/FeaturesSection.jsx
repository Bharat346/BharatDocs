import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection({ theme, features }) {
  const isDark = theme === "dark";

  return (
    <section className="relative py-24 overflow-hidden">
      {/* PREMIUM BACKGROUND */}
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gray-900"
              : "bg-white"
          }`}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader isDark={isDark} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
      className="text-center mb-20 relative z-10"
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
          ${isDark ? "bg-white/10 border border-white/20" : "bg-gray-100 border border-gray-200"}
        `}
      >
        <span
          className={`
            text-md font-roboto tracking-wider
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
          text-4xl sm:text-5xl font-roboto mb-6
          ${isDark ? "text-gray-100" : "text-gray-900"}
        `}
      >
        Built for{" "}
        <span className="bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
          Professional Excellence
        </span>
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`
          text-lg sm:text-xl font-mono max-w-3xl mx-auto leading-relaxed
          ${isDark ? "text-gray-300" : "text-gray-600"}
        `}
      >
        Everything you need to organize, search, and collaborate on documents
        with enterprise-level performance and reliability.
      </motion.p>
    </motion.div>
  );
}
