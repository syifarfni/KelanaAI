"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trip } from "@/types/trip";
import { getTrips } from "@/services/TripServices";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import TripCard from "@/components/TripCard";
import Pagination from "@/components/Pagination";

type SortOption = "newest" | "oldest" | "highest_budget";

const ITEMS_PER_PAGE = 10;

export default function TripsPage() {
  const { user, ready, signOut } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!ready) return;
    getTrips()
      .then(setTrips)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ready]);

  // Reset ke page 1 setiap kali filter/sort berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort]);

  const filtered = useMemo(() => {
    let result = [...trips];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.destination.toLowerCase().includes(q) ||
          t.travel_style.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sort === "newest")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest")
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "highest_budget")
        return b.budget - a.budget;
      return 0;
    });

    return result;
  }, [trips, search, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const hasActiveFilter = search.trim() !== "" || sort !== "newest";

  function resetFilters() {
    setSearch("");
    setSort("newest");
  }

  const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
    { value: "newest", label: "Newest", icon: "⬇" },
    { value: "oldest", label: "Oldest", icon: "⬆" },
    { value: "highest_budget", label: "Highest Budget", icon: "💰" },
  ];

  if (!ready) return null;

  return (
    <div
      className="min-h-screen bg-[#f4f1e8]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <Navbar user={user} onSignOut={signOut} />

      {/* ── Page header ── */}
      <div className="bg-[#3d4a2e] border-b border-[#4e5e38]">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Trip History
            </h1>
            <p className="text-[#a8b890] text-sm mt-0.5">
              All your past travel plans in one place
            </p>
          </div>
          {!loading && !error && (
            <div className="bg-[#ffffff18] border border-[#ffffff22] rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{trips.length}</p>
              <p className="text-xs text-[#a8b890]">Trips planned</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* ── Search & Filter bar ── */}
        {!loading && !error && trips.length > 0 && (
          <div className="bg-white border border-[#e0ddd0] rounded-2xl p-4 mb-6 flex flex-col gap-3 shadow-sm">
            {/* Search + Sort dropdown sejajar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8b890] text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by destination or travel style..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#f4f1e8] border border-[#e0ddd0] rounded-xl text-[#2e3a20] placeholder-[#b0b49a] focus:outline-none focus:ring-2 focus:ring-[#6b7a50] focus:border-transparent transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8b890] hover:text-[#5a6e42] transition-colors cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort dropdown */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="shrink-0 px-3 py-2.5 text-sm bg-[#f4f1e8] border border-[#e0ddd0] rounded-xl text-[#2e3a20] focus:outline-none focus:ring-2 focus:ring-[#6b7a50] focus:border-transparent transition cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Result count + Reset */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#9a9e88]">
                Showing{" "}
                <span className="font-semibold text-[#5a6e42]">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#5a6e42]">{filtered.length}</span>{" "}
                trips
              </p>
              {hasActiveFilter && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#9a9e88] hover:text-[#5a6e42] transition-colors cursor-pointer underline underline-offset-2"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

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
            <p className="text-sm text-[#8a9070]">Loading your trips...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty state — no trips at all */}
        {!loading && !error && trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="text-6xl">🗺️</span>
            <h2
              className="text-xl font-semibold text-[#2e3a20]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              No trips yet
            </h2>
            <p className="text-sm text-[#8a9070]">
              Plan your first trip and it will show up here.
            </p>
            <Link
              href="/"
              className="mt-2 bg-[#3d4a2e] hover:bg-[#2e3820] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              ✈ Plan a Trip
            </Link>
          </div>
        )}

        {/* Empty state — no results from filter */}
        {!loading && !error && trips.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">🔍</span>
            <p className="text-base font-semibold text-[#2e3a20]">
              No trips match your search
            </p>
            <p className="text-sm text-[#8a9070]">
              Try a different destination or reset the filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-1 text-sm text-[#5a6e42] underline underline-offset-2 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Trip grid */}
        {!loading && !error && paginated.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginated.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-[#a0a888] border-t border-[#e0ddd0]">
        KelanaAI © 2026 · Built with Amazon Bedrock
      </footer>
    </div>
  );
}
