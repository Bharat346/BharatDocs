import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PenTool, FilePlus, LayoutDashboard, Book, Settings } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const cards = [
    { label: "Add Blog", icon: <FilePlus className="w-5 h-5" />, path: "/admin/blogs/add-blogs" },
    { label: "Open Editor", icon: <PenTool className="w-5 h-5" />, path: "/admin/blogs/blog-editor" },
    { label: "Blog Meta Manager", icon: <Settings className="w-5 h-5" />, path: "/admin/blogs/manager" },
    { label: "Add Notes", icon: <FilePlus className="w-5 h-5" />, path: "/admin/notes/add-notes" },
    { label: "Manage Notes", icon: <Book className="w-5 h-5" />, path: "/admin/notes/manager" },
  ];

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <br /><br /><br />
      <div className="max-w-6xl mx-auto">
        {/* Header with SVG */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
            Admin Dashboard
          </h1>
        </div>
        <br />
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map(({ label, icon, path }, index) => (
            <div
              key={index}
              onClick={() => navigate(path)}
              className="cursor-pointer p-6 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-gray-800/50 shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 flex items-center gap-4"
            >
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                {icon}
              </div>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-300">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
