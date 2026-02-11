"use client";
import NavItem from "./nav.item";
import DropdownDocuments from "./dropdown.docs";
import DropdownNotes from "./dropdown.notes";

export default function NavDesktop({
  navItems,
  theme,
  activeDropdown,
  setActiveDropdown,
}) {
  return (
    <div className="hidden lg:flex items-center gap-1">
      {navItems.map((item) => (
        <NavItem
          key={item.label}
          item={item}
          theme={theme}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
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
