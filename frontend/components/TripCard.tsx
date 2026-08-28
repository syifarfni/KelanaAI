import Link from "next/link";
import { Trip } from "@/types/trip";
import {
  STYLE_BADGE,
  CATEGORY_BADGE,
  getDestinationFlag,
  formatBudget,
} from "@/constants/tripStyles";

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const date = new Date(trip.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const flag = getDestinationFlag(trip.destination);
  const categoryBadge = CATEGORY_BADGE[trip.category];
  const styleBadge = STYLE_BADGE[trip.travel_style];

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block bg-white border border-[#e0ddd0] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#a8b890] transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl leading-none">{flag}</span>
          <div>
            <h3
              className="text-lg font-bold text-[#2e3a20] capitalize group-hover:text-[#5a6e42] transition-colors leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {trip.destination}
            </h3>
            <p className="text-xs text-[#9a9e88] mt-0.5">{date}</p>
          </div>
        </div>
        {/* AI indicator dot */}
        <div className="flex items-center gap-1 mt-1">
          <span
            className={`w-2 h-2 rounded-full ${
              trip.ai_recommendation ? "bg-[#7a9e50]" : "bg-[#d0cdb8]"
            }`}
          />
          <span className="text-xs text-[#9a9e88]">
            {trip.ai_recommendation ? "AI ready" : "No AI"}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {categoryBadge && (
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryBadge.className}`}
          >
            {categoryBadge.label}
          </span>
        )}
        {styleBadge && (
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${styleBadge.className}`}
          >
            {styleBadge.label}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#f4f1e8] rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-[#8a9070]">Duration</p>
          <p className="text-sm font-semibold text-[#2e3a20]">{trip.days} days</p>
        </div>
        <div className="bg-[#f4f1e8] rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-[#8a9070]">Budget</p>
          <p className="text-sm font-semibold text-[#2e3a20]">
            {formatBudget(trip.budget)}
          </p>
        </div>
        <div className="bg-[#f4f1e8] rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-[#8a9070]">Daily</p>
          <p className="text-sm font-semibold text-[#2e3a20]">
            {formatBudget(trip.daily_budget)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex justify-end">
        <span className="text-xs text-[#a8b890] group-hover:text-[#5a6e42] transition-colors">
          View details →
        </span>
      </div>
    </Link>
  );
}
