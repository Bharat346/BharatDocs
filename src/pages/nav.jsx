import React, { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Menu, ChevronDown, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDark } from "@/hooks/darkmode";

const Navbar = () => {
  const { isDark, setIsDark } = useDark();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Controls dropdowns
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to toggle dropdowns
  const toggleDropdown = (dropdown) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  return (
    <nav className="flex justify-between items-center p-4 shadow-md bg-white dark:bg-gray-900 fixed top-0 w-full z-50">
      {/* Logo */}
      <div
        className="text-xl font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Bharat Docs
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4 text-lg">
        <Button
          variant="ghost"
          className="text-gray-900 dark:text-white"
          onClick={() => navigate("/")}
        >
          Home
        </Button>

        {/* Blogs Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center gap-1 text-gray-900 dark:text-white"
            onClick={() => toggleDropdown("blogs")}
          >
            Docs <ChevronDown size={16} />
          </Button>
          {activeDropdown === "blogs" && (
            <div className="absolute mt-2 bg-white dark:bg-gray-800 border shadow-lg rounded-md w-40">
              <Button
                variant="ghost"
                className="w-full text-left"
                onClick={() => {
                  setActiveDropdown(null);
                  navigate("/blogs/all-blogs");
                }}
              >
                All
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left"
                onClick={(e) => {
                  setActiveDropdown(null);
                  navigate(
                    `/blogs/all-blogs?category=${e.target.innerText.toLowerCase()}`
                  );
                }}
              >
                English
              </Button>

              <Button
                variant="ghost"
                className="w-full text-left"
                onClick={(e) => {
                  setActiveDropdown(null);
                  navigate(
                    `/blogs/all-blogs?category=${e.target.innerText.toLowerCase()}`
                  );
                }}
              >
                General Knowledge
              </Button>

              <Button
                variant="ghost"
                className="w-full text-left"
                onClick={(e) => {
                  setActiveDropdown(null);
                  navigate(
                    `/blogs/all-blogs?category=${e.target.innerText.toLowerCase()}`
                  );
                }}
              >
                coding
              </Button>
            </div>
          )}
        </div>

        {/* Notes Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center gap-1 text-gray-900 dark:text-white"
            onClick={() => navigate("notes/view")}
          >
            Notes
          </Button>
        </div>

        {/* Dark Mode Toggle */}
        <Button variant="ghost" onClick={() => setIsDark(!isDark)}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <Button variant="ghost" onClick={() => setIsDark(!isDark)}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        <Button variant="ghost" onClick={() => setMenuOpen(true)}>
          <Menu size={24} className="text-gray-900 dark:text-white" />
        </Button>
      </div>

      {/* Mobile Sidebar Menu */}
      {menuOpen && (
        <div className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg flex flex-col z-50">
          {/* Close Button */}
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <span className="text-xl font-bold text-blue-600">Menu</span>
            <Button variant="ghost" onClick={() => setMenuOpen(false)}>
              <X size={24} className="text-gray-900 dark:text-white" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col p-4 space-y-2 overflow-y-auto">
            <Button
              variant="ghost"
              className="w-full text-left"
              onClick={() => navigate("/")}
            >
              Home
            </Button>

            {/* Blogs Dropdown */}
            <Button
              variant="ghost"
              className="w-full flex justify-between items-center text-left"
              onClick={() => toggleDropdown("blogs")}
            >
              Docs{" "}
              {activeDropdown === "blogs" ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </Button>
            {activeDropdown === "blogs" && (
              <div className="pl-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full text-left"
                  onClick={() => {
                    setActiveDropdown(null);
                    navigate("/blogs/all-blogs");
                  }}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-left"
                  onClick={(e) => {
                    setActiveDropdown(null);
                    navigate(
                      `/blogs/all-blogs?category=${e.target.innerText.toLowerCase()}`
                    );
                  }}
                >
                  English
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-left"
                  onClick={() => {
                    setActiveDropdown(null);
                    navigate(
                      `/blogs/all-blogs?category=${e.target.innerText.toLowerCase()}`
                    );
                  }}
                >
                  General Knowledge
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-left"
                  onClick={(e) => {
                    setActiveDropdown(null);
                    navigate(
                      `/blogs/all-blogs?category=${e.target.innerText.toLowerCase()}`
                    );
                  }}
                >
                  coding
                </Button>
              </div>
            )}

            {/* Notes Dropdown */}
            <Button
              variant="ghost"
              className="w-full flex justify-between items-center text-left"
              onClick={() => navigate("notes/view")}
            >
              Notes
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
