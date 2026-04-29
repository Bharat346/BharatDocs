"use client";
import { useRef } from "react";

import NavItem from "./nav.item";
import DropdownDocuments from "./dropdown.docs";
import DropdownNotes from "./dropdown.notes";

export default function NavDesktop({
  navItems,
  theme,
  activeDropdown,
  setActiveDropdown,
}) {
  const timeoutRef = useRef(null);

  const handleMouseEnter = (label) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
  };

  return (
    <div className="hidden lg:flex items-center gap-1">
      {navItems.map((item) => (
        <NavItem
          key={item.label}
          item={item}
          theme={theme}
          isActive={activeDropdown === item.label}
          onEnter={() => handleMouseEnter(item.label)}
          onLeave={handleMouseLeave}
        >
          {item.children && (
            <DropdownDocuments items={item.children} theme={theme} />
          )}
          {item.structure && (
            <DropdownNotes structure={item.structure} theme={theme} />
          )}
        </NavItem>
      ))}
    </div>
  );
}

