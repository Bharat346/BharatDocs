import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./pages/nav";
import HeroSection from "./pages/home";
import AddBlog from "./pages/admin/AddBlogs";
import BlogList from "./pages/docs/showBlogs";
import RichTextEditor from "./pages/admin/editor";
import BlogMetaManager from "./pages/admin/subLinksManager";
import BlogTemplate from "./pages/docs/BlogTemplate";
import Login from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import Dashboard from "./pages/admin/DashBoard";
import ProtectedRoute from "./pages/admin/ProtectedRoute";
import Confirm from "./pages/Confirm";
// import { Helmet } from "react-helmet-async";

import NotesFolderForm from "./pages/admin/AddNotes";
import NotesManager from "./pages/admin/NotesManager";
import NotesView from "./pages/Notes/NotesView";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <Helmet>
        <meta
          httpEquiv="Content-Security-Policy"
          content="
      default-src 'self';
      script-src 'self';
      connect-src 'self' https://api.github.com;
      frame-ancestors 'none';
    "
        />
      </Helmet> */}

      <Navbar />
      <Routes>
        <Route exact path="/" element={<HeroSection />} />
        <Route path="/blogs/all-blogs" element={<BlogList />} />
        <Route path="/blogs/all-blogs/:blogId" element={<BlogTemplate />} />
        <Route path="/admin/confirm" element={<Confirm />} />
        // In your router configuration
        <Route exact path="/notes/view" element={<NotesView />} />
        {/* <Route path="/notes/view/:folderPath*" element={<NotesView />} /> */}
        {/* Auth Routes */}
        {/* <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/register" element={<Register />} /> */}
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/blogs/add-blogs" element={<AddBlog />} />
          <Route path="/admin/blogs/blog-editor" element={<RichTextEditor />} />
          <Route path="/admin/blogs/manager" element={<BlogMetaManager />} />
          <Route path="/admin/notes/add-notes" element={<NotesFolderForm />} />
          <Route path="/admin/notes/manager" element={<NotesManager />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </QueryClientProvider>
  );
}

export default App;
