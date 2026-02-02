import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/magic-card";

export default function FeatureCard({ feature, index, theme }) {
  const Icon = feature.icon;
  const isDark = theme === "dark";

  const gradientColors = [
    { from: "#3B82F6", to: "#8B5CF6" }, // Blue → Purple
    { from: "#10B981", to: "#3B82F6" }, // Emerald → Blue
    { from: "#F59E0B", to: "#EF4444" }, // Amber → Red
    { from: "#8B5CF6", to: "#EC4899" }, // Purple → Pink
    { from: "#06B6D4", to: "#10B981" }, // Cyan → Emerald
    { from: "#EC4899", to: "#F59E0B" }, // Pink → Amber
  ];

  const colors = gradientColors[index % gradientColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="h-full relative group"
    >
      {/* Outer glow on hover */}
      <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-${colors.from}/20 to-${colors.to}/20 blur-xl`}
        />
      </div>

      <MagicCard
        gradientSize={220}
        gradientOpacity={isDark ? 0.35 : 0.15}
        gradientFrom={colors.from}
        gradientTo={colors.to}
        className="h-full rounded-3xl overflow-hidden shadow-xl"
      >
        <Card
          className={`
            h-full rounded-3xl border backdrop-blur-xl border-transparent
            ${isDark
              ? "bg-gray-900/70 text-gray-100 border-gray-700"
              : "bg-white/90 text-gray-900 border-gray-200"}
          `}
        >
          <CardContent className="p-8 relative z-10 flex flex-col h-full">
            {/* Icon with glow */}
            <motion.div
              className="relative mb-6"
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className={`
                  relative inline-flex h-16 w-16 items-center justify-center rounded-xl border
                  ${isDark
                    ? "border-white/15 bg-gradient-to-br from-gray-800 to-gray-900"
                    : "border-gray-200 bg-gradient-to-br from-gray-50 to-white"}
                `}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent blur-sm" />
                <Icon
                  className={`h-7 w-7 relative z-10 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                />
              </div>
            </motion.div>

            {/* Content */}
            <div className="space-y-3 flex-1">
              <h3
                className={`
                  text-xl font-roboto tracking-tight bg-gradient-to-r 
                  ${isDark ? "from-gray-100 to-gray-300" : "from-gray-900 to-gray-700"}
                  bg-clip-text text-transparent
                `}
              >
                {feature.title}
              </h3>
              <p
                className={`
                  text-sm leading-relaxed font-mono tracking-wide
                  ${isDark ? "text-gray-400/80" : "text-gray-600/90"}
                `}
              >
                {feature.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </MagicCard>
    </motion.div>
  );
}
