"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ItineraryMarkdown from "@/components/ItineraryMarkdown";
import { askAI } from "@/services/AskService";

interface Message {
  role: "user" | "ai";
  content: string;
  documents?: string[];
}

export default function ChatPage() {
  const { user, ready, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hi! I'm KelanaAI, your travel assistant. Ask me anything about travel destinations, tips, budgeting, or itinerary ideas!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await askAI(question);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: res.answer, documents: res.documents },
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            err instanceof Error
              ? `Sorry, something went wrong: ${err.message}`
              : "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div
      className="min-h-screen bg-[#f4f1e8] flex flex-col"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <Navbar user={user} onSignOut={signOut} />

      {/* Page header */}
      <div className="bg-[#3d4a2e] border-b border-[#4e5e38]">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            💬 Chat with KelanaAI
          </h1>
          <p className="text-[#a8b890] text-xs mt-0.5">
            Ask anything about travel — powered by Amazon Bedrock Knowledge Base
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  msg.role === "ai"
                    ? "bg-[#3d4a2e] text-white"
                    : "bg-[#c8d4a0] text-[#2e3a20]"
                }`}
              >
                {msg.role === "ai" ? "🤖" : "👤"}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-[#3d4a2e] text-white rounded-tr-sm"
                    : "bg-white border border-[#e0ddd0] text-[#2e3a20] rounded-tl-sm"
                }`}
              >
                {msg.role === "ai" ? (
                  <ItineraryMarkdown content={msg.content} />
                ) : (
                  <p>{msg.content}</p>
                )}

                {/* Source documents */}
                {msg.documents && msg.documents.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#e0ddd0]">
                    <p className="text-xs text-[#9a9e88] mb-1">Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      {msg.documents.map((doc, j) => (
                        <span
                          key={j}
                          className="text-xs bg-[#f4f1e8] text-[#6b7a50] px-2 py-0.5 rounded-full border border-[#e0ddd0]"
                        >
                          📄 {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3d4a2e] flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-white border border-[#e0ddd0] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-[#a8b890] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-[#a8b890] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-[#a8b890] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-[#e0ddd0] bg-white px-6 py-4">
        <form
          onSubmit={handleSend}
          className="max-w-3xl mx-auto flex gap-3 items-end"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Ask about destinations, tips, budgets..."
            rows={1}
            className="flex-1 resize-none border border-[#d0cdb8] rounded-xl px-4 py-3 text-sm text-[#2e3a20] bg-[#fafaf5] placeholder-[#b0b49a] focus:outline-none focus:ring-2 focus:ring-[#6b7a50] focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#3d4a2e] hover:bg-[#2e3820] disabled:bg-[#b0b99a] text-white rounded-xl px-5 py-3 text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            Send
          </button>
        </form>
        <p className="text-center text-xs text-[#b0b49a] mt-2 max-w-3xl mx-auto">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
