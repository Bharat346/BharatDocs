"use client";

import { useState, useEffect } from "react";
import { useThemeContext } from "@/components/ThemeProvider";
import { NAV_ITEMS } from "./nav.config";
import NavLogo from "./nav.logo";
import NavDesktop from "./nav.desk";
import NavMobile from "./nav.mobile";
import { Menu, X, Sun, Moon } from "lucide-react";

export default function NavBar() {
  const { theme, toggleTheme } = useThemeContext();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <nav
  className={`fixed top-0 left-0 right-0 z-150 transition-all duration-300 ${
    theme === "dark"
      ? isScrolled
        ? "bg-black backdrop-blur-xl py-0"
        : "bg-black backdrop-blur-xl py-2"
      : isScrolled
        ? "bg-white backdrop-blur-xl py-0"
        : "bg-white backdrop-blur-xl py-2"
  }`}
>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <NavLogo theme={theme} />
          <NavDesktop
            navItems={NAV_ITEMS}
            theme={theme}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-800 text-yellow-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        <NavMobile
          isOpen={isMobileMenuOpen}
          navItems={NAV_ITEMS}
          theme={theme}
          closeMobile={closeMobile}
        />
      </div>
    </nav>
  );
}
