"use client";

import Link from "next/link";
import { useThemeContext } from "@/components/ThemeProvider";
import { Menu, X, Moon, Sun, ChevronDown, BookOpen, Home, Code, GraduationCap, FileText, Network, Brain, Layers, Atom } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DOCS_SUBMENU = [
  { label: "All Documents", href: "/docs", icon: FileText },
  { label: "Node js", href: "/docs/nodejs", icon: Code },
  { label: "DBMS", href: "/docs/dbms", icon: FileText },
  { label: "Static GK", href: "/docs/statik-gk", icon: BookOpen },
  { label: "One Word", href: "/docs/oneword", icon: FileText },
  { label: "Phrasal Verb", href: "/docs/phraselverb", icon: FileText },
];

// Simplified Notes structure with only 2 categories
const NOTES_STRUCTURE = [
  {
    title: "Computer Science",
    icon: Code,
    subjects: [
      { name: "Computer Networks", href: "/notes/cse/computer-networks", icon: Network },
      { name: "Machine Learning", href: "/notes/cse/machine-learning", icon: Brain },
      { name: "Theory of Computation", href: "/notes/cse/theory-of-computation", icon: Layers },
      { name: "Quantum Computing", href: "/notes/cse/quantum-computing", icon: Atom },
      { name: "Data Mining", href: "/notes/cse/data-mining", icon: Layers },
      { name: "Algorithms", href: "/notes/cse/algorithms", icon: Code },
    ]
  },
  {
    title: "Competitive Exams",
    icon: GraduationCap,
    subjects: [
      { name: "JEE Main & Advanced", href: "/notes/exams/jee", icon: GraduationCap },
      { name: "GATE", href: "/notes/exams/gate", icon: GraduationCap },
      { name: "SSC", href: "/notes/exams/ssc", icon: FileText },
      { name: "UPSC", href: "/notes/exams/upsc", icon: FileText },
    ]
  }
];

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Documents", href: "/docs", children: DOCS_SUBMENU },
  { label: "Notes", href: "/notes", structure: NOTES_STRUCTURE },
];

export default function NavBar() {
  const { theme, toggleTheme } = useThemeContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const mobileMenuRef = useRef(null);
  const dropdownRefs = useRef({});
  const leaveTimerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (label) => {
    // Clear any existing leave timer
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    
    setActiveDropdown(label);
    setIsDropdownVisible(true);
  };

  const handleMouseLeave = (label) => {
    // Set a delay before closing the dropdown
    leaveTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setIsDropdownVisible(false);
    }, 200); // 200ms delay for smoother transition
  };

  const toggleCategory = (category) => {
    setOpenCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50"
            : "bg-white/95 backdrop-blur-xl border-b border-gray-200/50"
        } ${
          isScrolled
            ? theme === "dark"
              ? "shadow-2xl shadow-black/30"
              : "shadow-xl shadow-gray-200/30"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-400 shadow-lg"
                >
                  <BookOpen className="h-6 w-6 text-white" />
                </motion.div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-transparent rounded-xl blur-sm group-hover:blur-md transition-all duration-300" />
              </div>
              <div className="flex flex-col leading-tight">
                <span
                  className={`font-mono text-xl bg-gradient-to-r ${
                    theme === "dark"
                      ? "from-gray-100 via-white to-gray-100"
                      : "from-gray-900 via-gray-800 to-gray-900"
                  } bg-clip-text text-transparent`}
                >
                  Bharat Docs
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={() => handleMouseLeave(item.label)}
                  ref={(el) => {
                    if (el) {
                      dropdownRefs.current[item.label] = el;
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    className={`group relative px-5 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 font-mono ${
                      theme === "dark"
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                    {(item.children || item.structure) && (
                      <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`} />
                    )}
                    
                    {/* Hover underline effect */}
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ${
                        activeDropdown === item.label ? "w-8" : "group-hover:w-8"
                      }`}
                    />
                  </Link>

                  {/* Dropdown Menu for Documents */}
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute left-0 mt-2 w-64 rounded-xl border shadow-2xl ${
                        theme === "dark"
                          ? "bg-gray-900/95 border-gray-800/50 backdrop-blur-xl"
                          : "bg-white/95 border-gray-200/50 backdrop-blur-xl"
                      }`}
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={() => handleMouseLeave(item.label)}
                      style={{ 
                        pointerEvents: isDropdownVisible ? 'auto' : 'none' 
                      }}
                    >
                      <div className="p-2">
                        <div
                          className={`text-xs font-mono uppercase tracking-wider px-3 py-2 ${
                            theme === "dark"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          {item.label}
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 ${
                                theme === "dark"
                                  ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                                  : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                              }`}
                            >
                              {child.icon && <child.icon className="h-4 w-4 mr-3" />}
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Special Dropdown for Notes */}
                  {item.structure && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute left-0 mt-2 w-[500px] rounded-xl border shadow-2xl ${
                        theme === "dark"
                          ? "bg-gray-900/95 border-gray-800/50 backdrop-blur-xl"
                          : "bg-white/95 border-gray-200/50 backdrop-blur-xl"
                      }`}
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={() => handleMouseLeave(item.label)}
                      style={{ 
                        pointerEvents: isDropdownVisible ? 'auto' : 'none' 
                      }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`text-xs font-mono uppercase tracking-wider ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Browse Notes by Category
                          </div>
                          <Link
                            href="/notes"
                            className={`text-sm font-roboto px-3 py-1.5 rounded-lg transition-all duration-200 ${
                              theme === "dark"
                                ? "text-blue-400 hover:text-blue-300 hover:bg-gray-800/50"
                                : "text-blue-600 hover:text-blue-700 hover:bg-gray-100/80"
                            }`}
                          >
                            View All →
                          </Link>
                        </div>
                        
                        {/* Single column layout for 2 categories */}
                        <div className="space-y-6">
                          {/* CSE Column */}
                          {item.structure[0] && item.structure[0].subjects && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Code className={`h-5 w-5 ${
                                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                                }`} />
                                <h3 className={`font-roboto text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                  Computer Science
                                </h3>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {item.structure[0].subjects.map((subject) => (
                                  <Link
                                    key={subject.name}
                                    href={subject.href}
                                    className={`group flex items-center gap-2 p-2 rounded-lg text-sm font-mono transition-all duration-200 ${
                                      theme === "dark"
                                        ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                                        : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                                    }`}
                                  >
                                    {subject.icon && <subject.icon className="h-3.5 w-3.5" />}
                                    <span className="truncate">{subject.name}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Competitive Exams Column */}
                          {item.structure[1] && item.structure[1].subjects && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className={`h-5 w-5 ${
                                  theme === "dark" ? "text-green-400" : "text-green-600"
                                }`} />
                                <h3 className={`font-roboto text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                  Competitive Exams
                                </h3>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {item.structure[1].subjects.map((subject) => (
                                  <Link
                                    key={subject.name}
                                    href={subject.href}
                                    className={`group flex items-center gap-2 p-2 rounded-lg text-sm transition-all duration-200 font-mono ${
                                      theme === "dark"
                                        ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                                        : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                                    }`}
                                  >
                                    {subject.icon && <subject.icon className="h-3.5 w-3.5" />}
                                    <span className="truncate">{subject.name}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                  theme === "dark"
                    ? "bg-gray-800/50 hover:bg-gray-700/50 text-yellow-300"
                    : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-700"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700`}
                />
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300"
                    : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-700"
                }`}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`lg:hidden absolute top-full left-0 right-0 ${
                theme === "dark"
                  ? "border-gray-800/50 bg-gray-900/95 backdrop-blur-xl"
                  : "border-gray-200/50 bg-white/95 backdrop-blur-xl"
              }`}
              style={{
                maxHeight: "calc(100vh - 64px)",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label} className="space-y-1">
                    {/* Parent Item */}
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-mono transition-all duration-200 ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                            : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                        }`}
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        {item.label}
                      </Link>
                      
                      {/* Expand/Collapse button for items with children/structure */}
                      {(item.children || item.structure) && (
                        <button
                          onClick={() => toggleCategory(item.label)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === "dark"
                              ? "hover:bg-gray-800/50 text-gray-400"
                              : "hover:bg-gray-100/80 text-gray-500"
                          }`}
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-300 font-mono ${
                              openCategories.includes(item.label) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Children for Documents */}
                    {item.children && openCategories.includes(item.label) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 pl-4 border-l space-y-1"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 font-mono ${
                              theme === "dark"
                                ? "text-gray-400 hover:bg-gray-800/30 hover:text-white"
                                : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                            }`}
                          >
                            {child.icon && <child.icon className="h-4 w-4" />}
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}

                    {/* Structure for Notes */}
                    {item.structure && openCategories.includes(item.label) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {item.structure.map((category, index) => (
                          category && category.subjects ? (
                            <div key={category.title || index} className="space-y-2">
                              {/* Category Header */}
                              <div className="flex items-center gap-2 px-4 py-2">
                                <category.icon className={`h-4 w-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                                <span className={`text-sm font-roboto ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{category.title}</span>
                              </div>
                              
                              {/* Subjects Grid */}
                              <div className="grid grid-cols-2 gap-1 pl-4 pr-2">
                                {category.subjects.map((subject) => (
                                  <Link
                                    key={subject.name}
                                    href={subject.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all font-mono duration-200 ${
                                      theme === "dark"
                                        ? "text-gray-400 hover:bg-gray-800/30 hover:text-white"
                                        : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                                    }`}
                                  >
                                    {subject.icon && <subject.icon className="h-3 w-3" />}
                                    <span className="truncate">{subject.name}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : null
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer */}
      <div className="h-16 lg:h-20" />
    </>
  );
}