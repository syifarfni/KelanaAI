"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface TripResult {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  travel_style: string;
  daily_budget: number;
  ai_recommendation: string | null;
  created_at: string;
}

const TRAVEL_STYLES = ["Family", "Solo", "Backpacker", "Couple", "Luxury"];

const STYLE_ICONS: Record<string, string> = {
  Family: "👨‍👩‍👧‍👦",
  Solo: "🧳",
  Backpacker: "🎒",
  Couple: "💑",
  Luxury: "✨",
};

export default function Home() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState<number>(5);
  const [budget, setBudget] = useState<number>(2000);
  const [travelStyle, setTravelStyle] = useState("Family");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TripResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: create trip
      const response = await fetch("http://localhost:8000/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days,
          budget,
          travel_style: travelStyle,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        const detail = err.detail;
        if (Array.isArray(detail)) {
          throw new Error(detail.map((d: { msg: string }) => d.msg).join(", "));
        }
        throw new Error(
          typeof detail === "string" ? detail : "Something went wrong"
        );
      }

      const trip: TripResult = await response.json();
      setResult(trip);

      // Step 2: generate AI recommendation
      const genResponse = await fetch(
        `http://localhost:8000/api/v1/trips/${trip.id}/generate`,
        { method: "POST" }
      );

      if (genResponse.ok) {
        const tripWithAI: TripResult = await genResponse.json();
        setResult(tripWithAI);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-[#f4f1e8]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* ── Hero Section ── */}
      <section className="relative bg-[#3d4a2e] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-[#4e5e38] opacity-40" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-[#5a6e42] opacity-30" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#4a5c34] opacity-20" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 bg-[#ffffff18] rounded-full px-5 py-1.5 mb-8 border border-[#ffffff22]">
            <span className="text-[#c8d4a0] text-xs font-medium tracking-widest uppercase">
              AI-Powered Travel Planner
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Plan Your Dream
            <br />
            <span className="text-[#c8d4a0]">Journey with AI</span>
          </h1>

          <p className="text-[#a8b890] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Tell us where you want to go, your budget, and travel style, and
            let KelanaAI craft the perfect itinerary for you.
          </p>

          {/* Stats row */}
         
        </div>
      </section>

      {/* ── Form Section ── */}
      <section className="max-w-2xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-[#e0ddd0] p-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-8 h-8 rounded-full bg-[#3d4a2e] flex items-center justify-center">
              <span className="text-white text-sm">✈</span>
            </div>
            <h2
              className="text-xl font-semibold text-[#2e3a20]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Where are you heading?
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Destination */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#6b7a50] uppercase tracking-widest">
                Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Japan, Bali, Paris..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="border border-[#d0cdb8] rounded-xl px-4 py-3 text-sm text-[#2e3a20] bg-[#fafaf5] placeholder-[#b0b49a] focus:outline-none focus:ring-2 focus:ring-[#6b7a50] focus:border-transparent transition"
              />
            </div>

            {/* Days + Budget side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6b7a50] uppercase tracking-widest">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  required
                  className="border border-[#d0cdb8] rounded-xl px-4 py-3 text-sm text-[#2e3a20] bg-[#fafaf5] focus:outline-none focus:ring-2 focus:ring-[#6b7a50] focus:border-transparent transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6b7a50] uppercase tracking-widest">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                  className="border border-[#d0cdb8] rounded-xl px-4 py-3 text-sm text-[#2e3a20] bg-[#fafaf5] focus:outline-none focus:ring-2 focus:ring-[#6b7a50] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Travel Style pills */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6b7a50] uppercase tracking-widest">
                Travel Style
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setTravelStyle(style)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition cursor-pointer ${
                      travelStyle === style
                        ? "bg-[#3d4a2e] text-white border-[#3d4a2e]"
                        : "bg-white text-[#5a6a40] border-[#c8c9a8] hover:border-[#6b7a50]"
                    }`}
                  >
                    <span>{STYLE_ICONS[style]}</span>
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-[#3d4a2e] hover:bg-[#2e3820] disabled:bg-[#9aaa80] text-white font-semibold rounded-xl py-3.5 text-sm transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Crafting your itinerary...
                </>
              ) : (
                <>✈ Generate My Itinerary</>
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* ── Result Section ── */}
      {result && (
        <section className="max-w-2xl mx-auto px-6 mt-8 mb-16">
          {/* Trip Summary Cards */}
          <div className="mb-3">
            <h2
              className="text-2xl font-bold text-[#2e3a20] mb-1"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Your Trip to{" "}
              <span className="text-[#5a6e42] capitalize">
                {result.destination}
              </span>
            </h2>
            <p className="text-sm text-[#8a9070]">
              Here&apos;s your personalized {result.days}-day travel plan
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Budget",
                value: `$${result.budget.toLocaleString()}`,
                icon: "💰",
              },
              {
                label: "Daily Budget",
                value: `$${result.daily_budget.toLocaleString()}/day`,
                icon: "📅",
              },
              {
                label: "Travel Style",
                value: result.travel_style,
                icon: STYLE_ICONS[result.travel_style] ?? "🧳",
              },
              {
                label: "Category",
                value: result.category,
                icon: "🏷️",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-[#e0ddd0] rounded-2xl p-4 text-center shadow-sm"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-xs text-[#8a9070] mt-1 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-[#2e3a20] leading-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* AI Itinerary */}
          {result.ai_recommendation ? (
            <div className="bg-white border border-[#e0ddd0] rounded-3xl shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="bg-[#3d4a2e] px-6 py-4 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#c8d4a0] flex items-center justify-center text-sm">
                  🗺
                </div>
                <div>
                  <h3
                    className="text-white font-semibold text-base"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    AI-Generated Itinerary
                  </h3>
                  <p className="text-[#a8b890] text-xs">
                    Powered by Amazon Bedrock
                  </p>
                </div>
              </div>

              {/* Itinerary content */}
              <div className="px-6 py-6">
                <ReactMarkdown
                  components={{
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold text-[#2e3a20] mt-5 mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-sm font-semibold text-[#5a6e42] mt-3 mb-1">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-[#3a4430] leading-relaxed mb-2">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-sm text-[#3a4430] space-y-1 mb-3 ml-2">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-[#2e3a20]">{children}</strong>
                    ),
                  }}
                >
                  {result.ai_recommendation}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#e0ddd0] rounded-2xl p-6 text-center text-sm text-[#9a9e88] italic">
              No AI recommendation generated yet.
            </div>
          )}
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-xs text-[#a0a888] border-t border-[#e0ddd0]">
        KelanaAI © 2026 · Built with Amazon Bedrock
      </footer>
    </main>
  );
}
