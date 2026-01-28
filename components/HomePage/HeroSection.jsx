import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Notebook, ArrowRight, Shield, Zap, Search, Globe } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HeroSection({ theme }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Mouse move effect for desktop
    const handleMouseMove = (e) => {
      if (window.innerWidth >= 1024) {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className={`relative pt-24 lg:pt-32 pb-20 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center ${theme === "dark" ? "bg-gray-950" : "bg-white"}`}>
      {/* Advanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <BackgroundGrid theme={theme} />
        <AnimatedGradients theme={theme} mousePosition={mousePosition} />
        <FloatingShapes theme={theme} />
        <ParticleBackground theme={theme} />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-20"
          >
            <HeroContent theme={theme} />
          </motion.div>

          {/* Right Visualization - Premium 3D Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative z-10 hidden lg:block"
          >
            <DocumentVisualization theme={theme} mousePosition={mousePosition} />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator theme={theme} />
    </section>
  );
}

function BackgroundGrid({ theme }) {
  return (
    <>
      <div className={`absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] ${theme === "dark" ? "opacity-10" : "opacity-5"}`} />
      {/* Radial gradient center */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${theme === "dark" ? "bg-blue-500/10" : "bg-blue-400/10"}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${theme === "dark" ? "bg-emerald-500/10" : "bg-emerald-400/10"}`} />
    </>
  );
}

function AnimatedGradients({ theme, mousePosition }) {
  return (
    <>
      {/* Interactive Gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${
            theme === "dark" 
              ? "rgba(59, 130, 246, 0.15)" 
              : "rgba(59, 130, 246, 0.1)"
          } 0%, transparent 50%)`,
        }}
      />
      
      {/* Animated Gradient Bars */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute h-1 w-64 rounded-full ${
            theme === "dark" ? "bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20" : "bg-gradient-to-r from-blue-400/10 via-blue-300/10 to-blue-400/10"
          }`}
          animate={{
            x: [i * 200, i * 200 + 400],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
          style={{
            top: `${20 + i * 30}%`,
            rotate: -45,
          }}
        />
      ))}
    </>
  );
}

function FloatingShapes({ theme }) {
  const shapes = [
    { icon: BookOpen, color: "text-blue-500", delay: 0 },
    { icon: Notebook, color: "text-emerald-500", delay: 0.3 },
    { icon: Shield, color: "text-blue-500", delay: 0.6 },
    { icon: Search, color: "text-emerald-500", delay: 0.9 },
  ];

  return (
    <>
      {shapes.map((shape, i) => {
        const Icon = shape.icon;
        return (
          <motion.div
            key={i}
            className="absolute hidden lg:block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.2, y: 0 }}
            transition={{
              duration: 2,
              delay: shape.delay,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: `${15 + i * 20}%`,
              top: `${10 + i * 15}%`,
            }}
          >
            <Icon className={`w-12 h-12 ${shape.color} opacity-20`} />
          </motion.div>
        );
      })}
    </>
  );
}

function ParticleBackground({ theme }) {
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="absolute inset-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${
            theme === "dark" ? "bg-blue-500/20" : "bg-blue-400/10"
          }`}
          animate={{
            x: [0, Math.random() * 100],
            y: [0, Math.random() * 100],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

function HeroContent({ theme }) {
  return (
    <div className="flex flex-col items-center text-center lg:text-left lg:items-start space-y-8 lg:space-y-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
      
      {/* Main Title */}
      <div className="space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl sm:text-7xl lg:text-7xl xl:text-7xl font-bold leading-tight"
        >
          <span className="block">
            <span className={`bg-gradient-to-r ${theme === "dark" ? "from-blue-400 to-blue-300" : "from-blue-600 to-blue-500"} bg-clip-text text-transparent`}>
              Bharat
            </span>
            <span className={`${theme === "dark" ? "text-white" : "text-gray-900"} ml-1`}>
              Docs
            </span>
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`text-base sm:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto lg:mx-0 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
        >
          Enterprise-grade platform for organizing, searching, and collaborating on documents with intelligent AI assistance. Trusted by research institutions, legal firms, and academic organizations worldwide.
        </motion.p>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start w-full max-w-lg mx-auto lg:mx-0"
      >
        {/* Explore Documents */}
        <Link href="/docs" className="flex-1">
          <Button
            size="lg"
            className={`w-full px-6 py-6 sm:px-8 sm:py-6 text-base sm:text-lg font-semibold rounded-xl relative overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-xl hover:shadow-blue-500/30 transition-all duration-300`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
            Explore Documents
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>

        {/* View Notes */}
        <Link href="/notes" className="flex-1">
          <Button
            variant="outline"
            size="lg"
            className={`w-full px-6 py-6 sm:px-8 sm:py-6 text-base sm:text-lg font-semibold rounded-xl border-2 backdrop-blur-sm transition-all duration-300 group relative overflow-hidden ${theme === "dark" ? "border-gray-700 bg-gray-900/30 hover:border-emerald-500 hover:bg-gray-800/50 text-white" : "border-gray-300 bg-white hover:border-emerald-500 hover:bg-gray-50 text-gray-800"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Notebook className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform" />
            View Notes
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

function DocumentVisualization({ theme, mousePosition }) {
  return (
    <div className="relative w-full h-[500px] perspective-1000">
      {/* Main Document Card */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-80 rounded-2xl shadow-2xl"
        animate={{
          rotateY: mousePosition.x * 0.1 - 10,
          rotateX: mousePosition.y * -0.1 + 10,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{
          background: theme === "dark" 
            ? "linear-gradient(145deg, #1e293b, #0f172a)"
            : "linear-gradient(145deg, #ffffff, #f8fafc)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Document lines */}
        <div className="absolute inset-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-400/10"}`}
              style={{ width: `${80 - i * 10}%` }}
            />
          ))}
        </div>
        
        {/* Document corner */}
        <div className="absolute top-4 right-4">
          <div className={`w-8 h-8 border-t-2 border-r-2 ${theme === "dark" ? "border-blue-500" : "border-blue-400"} rounded-tr-lg`} />
        </div>
      </motion.div>

      {/* Floating Note Card */}
      <motion.div
        className="absolute top-20 left-20 w-48 h-56 rounded-xl shadow-xl"
        animate={{
          rotateY: mousePosition.x * 0.05,
          rotateX: mousePosition.y * -0.05,
          y: [0, -10, 0],
        }}
        transition={{
          rotateY: { type: "spring", stiffness: 100 },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          background: theme === "dark" 
            ? "linear-gradient(145deg, #064e3b, #022c22)"
            : "linear-gradient(145deg, #d1fae5, #a7f3d0)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-4">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${theme === "dark" ? "bg-emerald-500" : "bg-emerald-400"}`} />
            <div className={`w-20 h-2 rounded-full ${theme === "dark" ? "bg-emerald-500/30" : "bg-emerald-400/20"}`} />
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full mb-2 ${theme === "dark" ? "bg-emerald-500/20" : "bg-emerald-400/10"}`}
              style={{ width: `${70 - i * 10}%` }}
            />
          ))}
        </div>
      </motion.div>

      {/* Search Card */}
      <motion.div
        className="absolute bottom-20 right-20 w-56 h-40 rounded-xl shadow-xl"
        animate={{
          rotateY: mousePosition.x * 0.08,
          rotateX: mousePosition.y * -0.08,
          y: [0, 10, 0],
        }}
        transition={{
          rotateY: { type: "spring", stiffness: 100 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
        style={{
          background: theme === "dark" 
            ? "linear-gradient(145deg, #1e3a8a, #1e40af)"
            : "linear-gradient(145deg, #dbeafe, #bfdbfe)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
            <div className={`w-32 h-2 rounded-full ${theme === "dark" ? "bg-blue-500/30" : "bg-blue-400/20"}`} />
          </div>
          <div className="space-y-2">
            <div className={`h-1.5 rounded-full ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-400/10"}`} style={{ width: "90%" }} />
            <div className={`h-1.5 rounded-full ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-400/10"}`} style={{ width: "70%" }} />
            <div className={`h-1.5 rounded-full ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-400/10"}`} style={{ width: "80%" }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ScrollIndicator({ theme }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block"
    >
      <div className="flex flex-col items-center">
        <span className={`text-sm mb-2 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-blue-500 flex justify-center"
        >
          <div className="w-1 h-3 rounded-full bg-blue-500 mt-2" />
        </motion.div>
      </div>
    </motion.div>
  );
}