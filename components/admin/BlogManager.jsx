"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, Eye, EyeOff, Star, StarOff,
  Save, X, Loader2, Check, FileText, Tag, Clock,
  Image as ImageIcon, Link as LinkIcon, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import BharatLoader from "@/components/ui/loader";
import { useThemeContext } from "@/components/ThemeProvider";

export default function BlogManager() {
  const { mounted } = useThemeContext();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: "", slug: "", description: "", coverImage: "",
    githubPath: "blogs/", author: "Bharat", tags: "",
    readTime: 5, isPublished: false, isFeatured: false,
  });

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      if (data.blogs) setBlogs(data.blogs);
    } catch (e) {
      console.error("Failed to fetch blogs:", e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "", slug: "", description: "", coverImage: "",
      githubPath: "blogs/", author: "Bharat", tags: "",
      readTime: 5, isPublished: false, isFeatured: false,
    });
    setEditingBlog(null);
    setShowForm(false);
  };

  const openEdit = (blog) => {
    setForm({
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      coverImage: blog.coverImage || "",
      githubPath: blog.githubPath,
      author: blog.author,
      tags: (blog.tags || []).join(", "),
      readTime: blog.readTime || 5,
      isPublished: blog.isPublished,
      isFeatured: blog.isFeatured,
    });
    setEditingBlog(blog);
    setShowForm(true);
  };

  const autoSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (val) => {
    setForm((f) => ({
      ...f,
      title: val,
      slug: editingBlog ? f.slug : autoSlug(val),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug || !form.description || !form.githubPath) {
      setStatusMsg({ type: "error", text: "Title, slug, description, and GitHub path are required" });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      readTime: parseInt(form.readTime) || 5,
    };

    try {
      let res;
      if (editingBlog) {
        res = await fetch(`/api/admin/blogs/${editingBlog.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: editingBlog ? "Blog updated!" : "Blog created!" });
        resetForm();
        fetchBlogs();
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed" });
      }
    } catch (e) {
      setStatusMsg({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setStatusMsg({ type: "success", text: "Blog deleted" });
      }
    } catch (e) {
      setStatusMsg({ type: "error", text: "Failed to delete" });
    }
    setDeleteConfirm(null);
  };

  const togglePublish = async (blog) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !blog.isPublished }),
      });
      if (res.ok) fetchBlogs();
    } catch (e) {}
  };

  const toggleFeatured = async (blog) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !blog.isFeatured }),
      });
      if (res.ok) fetchBlogs();
    } catch (e) {}
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-neutral-500 hover:text-blue-500 transition-colors group mb-4 text-sm">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Dashboard
            </Link>
            <h1 className="text-3xl font-black">Blog Manager</h1>
            <p className="text-neutral-500 mt-1">Create and manage blog posts</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> New Blog
          </button>
        </div>

        {/* Status Message */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                statusMsg.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {statusMsg.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {statusMsg.text}
              <button onClick={() => setStatusMsg(null)} className="ml-auto p-1 hover:bg-black/10 rounded">
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  {editingBlog ? "Edit Blog" : "New Blog Post"}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Title" required>
                  <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                    className="form-input" placeholder="My awesome post" />
                </FormField>
                <FormField label="Slug" required>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="form-input" placeholder="my-awesome-post" />
                </FormField>
              </div>

              <FormField label="Description" required>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="form-input min-h-[80px] resize-none" placeholder="Brief summary of the blog post" />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="GitHub Path" required icon={<LinkIcon className="w-3.5 h-3.5" />}>
                  <input value={form.githubPath} onChange={(e) => setForm({ ...form, githubPath: e.target.value })}
                    className="form-input" placeholder="blogs/my-post.mdx" />
                </FormField>
                <FormField label="Cover Image URL" icon={<ImageIcon className="w-3.5 h-3.5" />}>
                  <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    className="form-input" placeholder="https://..." />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Tags" icon={<Tag className="w-3.5 h-3.5" />}>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="form-input" placeholder="react, nextjs, web" />
                </FormField>
                <FormField label="Author">
                  <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="form-input" placeholder="Bharat" />
                </FormField>
                <FormField label="Read Time (min)" icon={<Clock className="w-3.5 h-3.5" />}>
                  <input type="number" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    className="form-input" min="1" max="60" />
                </FormField>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>

              <button onClick={handleSubmit} disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg">
                {saving ? <BharatLoader small text="" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : editingBlog ? "Update Blog" : "Create Blog"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blog List */}
        {loading ? (
          <div className="flex justify-center py-16"><BharatLoader small text="" /></div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No blogs yet</p>
            <p className="text-sm">Create your first blog post above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map((blog) => (
              <motion.div key={blog.id} layout
                className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/30 transition-all group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-neutral-300 dark:text-neutral-600">
                      {blog.title.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold truncate">{blog.title}</h3>
                    {!blog.isPublished && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 rounded">Draft</span>
                    )}
                    {blog.isFeatured && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{blog.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(blog.tags || []).slice(0, 3).map((t) => (
                      <span key={t} className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => togglePublish(blog)} title={blog.isPublished ? "Unpublish" : "Publish"}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    {blog.isPublished ? <EyeOff className="w-4 h-4 text-neutral-400" /> : <Eye className="w-4 h-4 text-emerald-500" />}
                  </button>
                  <button onClick={() => toggleFeatured(blog)} title={blog.isFeatured ? "Unfeature" : "Feature"}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    {blog.isFeatured ? <StarOff className="w-4 h-4 text-amber-500" /> : <Star className="w-4 h-4 text-neutral-400" />}
                  </button>
                  <button onClick={() => openEdit(blog)} title="Edit"
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <Edit3 className="w-4 h-4 text-blue-500" />
                  </button>
                  {deleteConfirm === blog.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(blog.id)} className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(blog.id)} title="Delete"
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, required, icon, children }) {
  return (
    <div>
      <label className="text-[10px] text-neutral-500 mb-1.5 block uppercase tracking-wider font-black flex items-center gap-1.5">
        {icon} {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      <style jsx global>{`
        .form-input {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--fg);
          transition: border-color 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}
