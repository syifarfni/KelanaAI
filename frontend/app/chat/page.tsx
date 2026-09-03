"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ItineraryMarkdown from "@/components/ItineraryMarkdown";
import {
  createConversation,
  listConversations,
  getConversationMessages,
  sendMessage,
  renameConversation,
} from "@/services/AskService";
import type { Conversation, ChatMessage } from "@/types/chat";

export default function ChatPage() {
  const { user, ready, signOut } = useAuth();

  // ── Sidebar state ──────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Rename state ───────────────────────────────────────────
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // ── Chat state ─────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Load conversation list ─────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const data = await listConversations();
      setConversations(data);
    } catch {
      // silent
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    loadConversations();
  }, [ready, loadConversations]);

  // ── Auto-scroll ────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // ── Select a conversation ──────────────────────────────────
  async function selectConversation(id: number) {
    setActiveId(id);
    setChatLoading(true);
    setMessages([]);
    try {
      const detail = await getConversationMessages(id);
      setMessages(detail.messages);
    } catch {
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  }

  // ── New conversation ───────────────────────────────────────
  async function handleNewChat() {
    try {
      const conv = await createConversation();
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
    } catch {
      // silent
    }
  }

  // ── Rename conversation ────────────────────────────────────
  async function handleRename(id: number) {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingId(null); return; }
    try {
      await renameConversation(id, trimmed);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c))
      );
    } finally {
      setRenamingId(null);
    }
  }

  // ── Send message ───────────────────────────────────────────
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    // If no active conversation, create one first
    let convId = activeId;
    if (!convId) {
      try {
        const conv = await createConversation();
        setConversations((prev) => [conv, ...prev]);
        setActiveId(conv.id);
        convId = conv.id;
      } catch {
        return;
      }
    }

    setInput("");
    // Optimistic: show user message immediately
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: question,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const res = await sendMessage(convId, question);

      // Replace temp message + add AI reply
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.user_message,
        res.ai_message,
      ]);

      // Update conversation title in sidebar if it changed
      if (res.title) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, title: res.title } : c
          )
        );
      }
    } catch (err: unknown) {
      const errMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          err instanceof Error
            ? `Sorry, something went wrong: ${err.message}`
            : "Sorry, something went wrong. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }

  if (!ready) return null;

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <div
      className="h-screen flex flex-col bg-[#f4f1e8]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <Navbar user={user} onSignOut={signOut} />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-0"
          } transition-all duration-200 bg-[#2e3820] flex flex-col overflow-hidden shrink-0`}
        >
          {/* Sidebar header */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-[#3d4a2e]">
            <h2
              className="text-white font-semibold text-sm"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Conversations
            </h2>
            <button
              onClick={handleNewChat}
              className="text-xs bg-[#5a6e42] hover:bg-[#6b7a50] text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              + New
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-2">
            {sidebarLoading ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-5 w-5 text-[#a8b890]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-xs text-[#6b7a50] py-8 px-4">
                No conversations yet.
                <br />Click "+ New" to start.
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative flex items-center border-l-2 transition-colors ${
                    conv.id === activeId
                      ? "bg-[#3d4a2e] border-[#c8d4a0]"
                      : "border-transparent hover:bg-[#3d4a2e]"
                  }`}
                >
                  {renamingId === conv.id ? (
                    // ── Inline rename input ──
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(conv.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="flex-1 mx-2 my-1 px-2 py-1.5 text-sm bg-[#2e3820] text-white border border-[#6b7a50] rounded-lg focus:outline-none"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => selectConversation(conv.id)}
                        className="flex-1 text-left px-4 py-3 text-sm cursor-pointer"
                      >
                        <p
                          className={`font-medium truncate leading-snug ${
                            conv.id === activeId ? "text-white" : "text-[#a8b890]"
                          }`}
                        >
                          {conv.title ?? "New conversation"}
                        </p>
                        <p className="text-xs text-[#6b7a50] mt-0.5">
                          {new Date(conv.created_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </button>

                      {/* Rename button — visible on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(conv.id);
                          setRenameValue(conv.title ?? "");
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-[#6b7a50] hover:text-[#c8d4a0] cursor-pointer text-xs px-1"
                        title="Rename"
                      >
                        ✏️
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ── Main chat area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat top bar */}
          <div className="bg-[#3d4a2e] border-b border-[#4e5e38] px-4 py-3 flex items-center gap-3 shrink-0">
            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-[#a8b890] hover:text-white transition-colors cursor-pointer text-lg leading-none"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <div>
              <p
                className="text-white font-semibold text-sm"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {activeConv?.title ?? "New Chat"}
              </p>
              <p className="text-[#a8b890] text-xs">
                KelanaAI · Powered by Amazon Bedrock
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-4">
              {/* Empty state */}
              {!chatLoading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <span className="text-5xl">✈️</span>
                  <h2
                    className="text-xl font-bold text-[#2e3a20]"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    Ask KelanaAI anything
                  </h2>
                  <p className="text-sm text-[#8a9070] max-w-sm">
                    Travel tips, destination ideas, budget planning — just type
                    your question below.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {[
                      "Best places in Japan for families?",
                      "Budget trip to Bali for 5 days?",
                      "What to pack for Europe in winter?",
                    ].map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setInput(hint)}
                        className="text-xs bg-white border border-[#d0cdb8] text-[#5a6e42] px-3 py-1.5 rounded-full hover:border-[#6b7a50] transition-colors cursor-pointer"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading history */}
              {chatLoading && (
                <div className="flex justify-center py-12">
                  <svg className="animate-spin h-6 w-6 text-[#6b7a50]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                      msg.role === "assistant"
                        ? "bg-[#3d4a2e] text-white"
                        : "bg-[#c8d4a0] text-[#2e3a20]"
                    }`}
                  >
                    {msg.role === "assistant" ? "🤖" : "👤"}
                  </div>

                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#3d4a2e] text-white rounded-tr-sm"
                        : "bg-white border border-[#e0ddd0] text-[#2e3a20] rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ItineraryMarkdown content={msg.content} />
                    ) : (
                      <p className="leading-relaxed">{msg.content}</p>
                    )}
                    <p
                      className={`text-xs mt-1.5 ${
                        msg.role === "user" ? "text-[#a8c890] text-right" : "text-[#b0b49a]"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {sending && (
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
          <div className="border-t border-[#e0ddd0] bg-white px-6 py-4 shrink-0">
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
                disabled={sending || !input.trim()}
                className="bg-[#3d4a2e] hover:bg-[#2e3820] disabled:bg-[#b0b99a] text-white rounded-xl px-5 py-3 text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                Send
              </button>
            </form>
            <p className="text-center text-xs text-[#b0b49a] mt-2 max-w-3xl mx-auto">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
