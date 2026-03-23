// lib/PDF/pdf.rag.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  User,
  Loader2,
  RefreshCw,
  MessageSquareText,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

export default function PDFChat({ nodeId, fileUrl, isDark }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [ingested, setIngested] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isQuerying]);

  const handleIngest = async () => {
    setIsIngesting(true);
    try {
      const res = await fetch("/api/pdf/rag/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId, fileUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setIngested(true);
        setMessages([
          {
            role: "system",
            content: `Document indexed successfully into ${data.chunkCount} searchable blocks. I'm ready to answer your questions about this PDF!`,
          },
        ]);
      } else {
        throw new Error(data.error || "Ingestion failed");
      }
    } catch (err) {
      setMessages([
        { role: "system", content: `Error indexing document: ${err.message}` },
      ]);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isQuerying) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsQuerying(true);

    try {
      const res = await fetch("/api/pdf/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, nodeId }),
      });

      if (!res.ok) throw new Error(`Query failed: ${res.status}`);

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${err.message}`,
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {!ingested && messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div
            className={`p-4 rounded-3xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}
          >
            <Sparkles size={48} className="text-blue-500" />
          </div>
          <h3
            className={`mt-6 text-lg font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Chat with Document
          </h3>
          <p
            className={`text-[13px] mt-2 max-w-[200px] leading-relaxed font-medium ${isDark ? "text-zinc-500" : "text-gray-400"}`}
          >
            Index this PDF to unlock AI-powered insights and Q&A.
          </p>
          <button
            onClick={handleIngest}
            disabled={isIngesting}
            className={`mt-8 flex items-center gap-3 px-6 py-3 rounded-2xl text-[13px] font-black tracking-wide transition-all ${
              isIngesting
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-xl shadow-blue-500/20"
            }`}
          >
            {isIngesting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {isIngesting ? "INDEXING PDF..." : "INDEX NOW"}
          </button>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-10"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600"
                      : isDark
                        ? "bg-zinc-800"
                        : "bg-white border border-gray-100"
                  }`}
                >
                  {m.role === "user" ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Sparkles
                      size={16}
                      className={isDark ? "text-blue-400" : "text-blue-600"}
                    />
                  )}
                </div>
                <div
                  className={`max-w-[85%] p-4 rounded-[20px] shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none font-medium text-[13.5px] leading-[1.6]"
                      : isDark
                        ? "bg-zinc-900/50 text-zinc-200 rounded-tl-none border border-white/5 backdrop-blur-sm"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div
                      className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""} prose-p:leading-relaxed prose-pre:bg-zinc-950/50`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeHighlight, rehypeKatex]}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isQuerying && (
              <div className="flex gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-zinc-800" : "bg-white border border-gray-100"}`}
                >
                  <Sparkles size={16} className="text-blue-400 animate-pulse" />
                </div>
                <div
                  className={`p-4 rounded-[20px] rounded-tl-none text-[13px] font-medium animate-pulse ${isDark ? "bg-zinc-900/50 text-zinc-500" : "bg-gray-50 text-gray-400"}`}
                >
                  Searching document...
                </div>
              </div>
            )}
          </div>

          <div
            className={`p-4 bg-transparent border-t ${isDark ? "border-white/5" : "border-gray-100"}`}
          >
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask a question..."
                className={`w-full pl-5 pr-14 py-4 rounded-2xl text-[13.5px] font-medium outline-none transition-all shadow-inner ${
                  isDark
                    ? "bg-zinc-900/80 border border-white/5 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder-zinc-600"
                    : "bg-gray-100/80 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400"
                }`}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isQuerying}
                className={`absolute right-2 top-2 p-2.5 rounded-xl transition-all ${
                  !input.trim() || isQuerying
                    ? "text-zinc-500 bg-transparent opacity-30"
                    : "text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-90"
                }`}
              >
                <Send size={18} />
              </button>
            </div>
            <p
              className={`text-[10px] text-center mt-3 font-bold uppercase tracking-tighter ${isDark ? "text-zinc-700" : "text-gray-300"}`}
            >
              Powered by Bhdocs RAG Engine
            </p>
          </div>
        </>
      )}
    </div>
  );
}
