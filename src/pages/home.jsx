import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Notebook } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white overflow-hidden">
      <FloatingDots />
      <MovingLines />
      <RadialGradient />
      <br />
      <div className="max-w-4xl mx-auto z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Discover Knowledge with{" "}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
            Bharat <span className="text-blue-400">Docs</span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto z-10"
        >
          Your all-in-one hub for tech documentation, coding guides, and smart
          study notes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-15 w-full z-10 flex flex-wrap justify-center item-center sm:flex-row gap-4"
        >
          <Button
            onClick={() => navigate("/blogs/all-blogs")}
            className="group relative overflow-hidden px-8 py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 w-[220px] sm:w-auto"
          >
            <span className="relative z-10 flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              Explore Docs
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>

          <Button
            onClick={() => navigate("/notes/view")}
            className="group relative overflow-hidden px-8 py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 w-[220px] sm:w-auto"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Notebook className="w-5 h-5" />
              Study Notes
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute top-20 right-6 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-30"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
}

function FloatingDots() {
  const dots = Array.from({ length: 20 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    size: Math.random() * 4 + 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 dark:opacity-10"
          style={{
            top: `${dot.y}%`,
            left: `${dot.x}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
          }}
          animate={{
            y: ["0%", "-15%", "5%", "0%"],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 8 + Math.random() * 5,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function MovingLines() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-40 bg-gradient-to-b from-blue-400 to-transparent opacity-30"
          style={{ left: `${i * 12 + 5}%`, top: "-20%" }}
          animate={{
            y: ["-20%", "120%"],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "linear",
          }}
        />
      ))}
    </motion.div>
  );
}

function RadialGradient() {
  return (
    <>
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-10 dark:opacity-5 mix-blend-multiply" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-10 dark:opacity-5 mix-blend-multiply" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl opacity-10 dark:opacity-5 mix-blend-multiply" />
    </>
  );
}
