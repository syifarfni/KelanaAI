"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Trip } from "@/types/trip";
import { getTrip } from "@/services/TripServices";
import ItineraryMarkdown from "@/components/ItineraryMarkdown";

const STYLE_ICONS: Record<string, string> = {
  Family: "👨‍👩‍👧‍👦",
  Solo: "🧳",
  Backpacker: "🎒",
  Couple: "💑",
  Luxury: "✨",
};

export default function TripDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTrip(id)
      .then(setTrip)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const date = trip
    ? new Date(trip.created_at).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const stats = trip
    ? [
        { label: "Budget", value: `$${trip.budget.toLocaleString()}`, icon: "💰" },
        { label: "Daily Budget", value: `$${trip.daily_budget.toLocaleString()}/day`, icon: "📅" },
        { label: "Travel Style", value: trip.travel_style, icon: STYLE_ICONS[trip.travel_style] ?? "🧳" },
        { label: "Category", value: trip.category, icon: "🏷️" },
      ]
    : [];

  return (
    <main
      className="min-h-screen bg-[#f4f1e8]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* Header */}
      <div className="bg-[#3d4a2e]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Link
            href="/trips"
            className="text-[#a8b890] text-xs hover:text-white transition-colors mb-3 inline-block"
          >
            ← Back to Trip History
          </Link>

          {loading && (
            <div className="h-8 w-48 bg-[#ffffff18] rounded-lg animate-pulse" />
          )}

          {trip && (
            <>
              <p className="text-[#a8b890] text-xs mb-1">{date}</p>
              <h1
                className="text-3xl font-bold text-white capitalize"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {trip.destination}
              </h1>
              <p className="text-[#c8d4a0] text-sm mt-1">
                {trip.days}-day trip · {STYLE_ICONS[trip.travel_style] ?? "🧳"}{" "}
                {trip.travel_style}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg
              className="animate-spin h-8 w-8 text-[#6b7a50]"
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
            <p className="text-sm text-[#8a9070]">Loading trip details...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {trip && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white border border-[#e0ddd0] rounded-2xl p-4 text-center shadow-sm"
                >
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-xs text-[#8a9070] mt-1 mb-0.5">{s.label}</p>
                  <p className="text-sm font-semibold text-[#2e3a20] leading-tight">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* AI Itinerary */}
            {trip.ai_recommendation ? (
              <div className="bg-white border border-[#e0ddd0] rounded-3xl shadow-sm overflow-hidden">
                <div className="bg-[#3d4a2e] px-6 py-4 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#c8d4a0] flex items-center justify-center text-sm">
                    🗺
                  </div>
                  <div>
                    <h2
                      className="text-white font-semibold text-base"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      AI-Generated Itinerary
                    </h2>
                    <p className="text-[#a8b890] text-xs">
                      Powered by Amazon Bedrock
                    </p>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <ItineraryMarkdown content={trip.ai_recommendation} />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#e0ddd0] rounded-2xl p-6 text-center text-sm text-[#9a9e88] italic">
                No AI itinerary generated for this trip.
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-[#a0a888] border-t border-[#e0ddd0]">
        KelanaAI © 2026 · Built with Amazon Bedrock
      </footer>
    </main>
  );
}
