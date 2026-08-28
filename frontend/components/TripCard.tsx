import Link from "next/link";
import { Trip } from "@/types/trip";

const STYLE_ICONS: Record<string, string> = {
  Family: "👨‍👩‍👧‍👦",
  Solo: "🧳",
  Backpacker: "🎒",
  Couple: "💑",
  Luxury: "✨",
};

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const date = new Date(trip.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block bg-white border border-[#e0ddd0] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#a8b890] transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-lg font-bold text-[#2e3a20] capitalize group-hover:text-[#5a6e42] transition-colors"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {trip.destination}
          </h3>
          <p className="text-xs text-[#9a9e88] mt-0.5">{date}</p>
        </div>
        <span className="text-2xl">
          {STYLE_ICONS[trip.travel_style] ?? "🧳"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#f4f1e8] rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-[#8a9070]">Duration</p>
          <p className="text-sm font-semibold text-[#2e3a20]">{trip.days}d</p>
        </div>
        <div className="bg-[#f4f1e8] rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-[#8a9070]">Budget</p>
          <p className="text-sm font-semibold text-[#2e3a20]">
            ${trip.budget.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#f4f1e8] rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-[#8a9070]">Style</p>
          <p className="text-sm font-semibold text-[#2e3a20]">
            {trip.travel_style}
          </p>
        </div>
      </div>

      {/* AI indicator */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              trip.ai_recommendation ? "bg-[#7a9e50]" : "bg-[#d0cdb8]"
            }`}
          />
          <span className="text-xs text-[#9a9e88]">
            {trip.ai_recommendation ? "AI itinerary ready" : "No AI itinerary"}
          </span>
        </div>
        <span className="text-xs text-[#a8b890] group-hover:text-[#5a6e42] transition-colors">
          View details →
        </span>
      </div>
    </Link>
  );
}
