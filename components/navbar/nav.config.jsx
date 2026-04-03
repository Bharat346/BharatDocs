import {
  FileText,
  Code,
  BookOpen,
  GraduationCap,
  Home,
  ExternalLink,
} from "lucide-react";

export const DOCS_SUBMENU = [
  { label: "All Documents", href: "/docs", icon: FileText },
  { label: "Node js", href: "/docs/nodejs", icon: Code },
  { label: "DBMS", href: "/docs/dbms", icon: FileText },
  { label: "Static GK", href: "/docs/statik-gk", icon: BookOpen },
  { label: "GPS", href: "/docs/gps", icon: FileText },
  { label: "Diffusion Models", href: "/docs/diffusion-models", icon: FileText },
  { label: "Fourier Transformation", href: "/docs/math-behind-the-fourier-transformation", icon: FileText },
];

export const NOTES_STRUCTURE = [
  {
    title: "Computer Science",
    icon: Code,
    subjects: [
      { name: "Sem 1", href: "/notes/cse/1st-sem", icon: BookOpen },
      { name: "Sem 2", href: "/notes/cse/2nd-sem", icon: BookOpen },
      { name: "Sem 3", href: "/notes/cse/3rd-sem", icon: BookOpen },
      { name: "Sem 4", href: "/notes/cse/4th-sem", icon: BookOpen },
      { name: "Sem 5", href: "/notes/cse/5th-sem", icon: BookOpen },
      { name: "Sem 6", href: "/notes/cse/6th-sem", icon: BookOpen },
    ],
  },
  {
    title: "Competitive Exams",
    icon: GraduationCap,
    subjects: [
      {
        name: "JEE Main & Advanced",
        href: "/notes/exams/jee",
        icon: GraduationCap,
      },
      { name: "GATE", href: "/notes/exams/gate", icon: GraduationCap },
      { name: "SSC", href: "/notes/exams/ssc", icon: GraduationCap },
      { name: "UPSC", href: "/notes/exams/upsc", icon: GraduationCap },
    ],
  },
];

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Documents", href: "/docs", children: DOCS_SUBMENU },
  { label: "Notes", href: "/notes", structure: NOTES_STRUCTURE },
];
