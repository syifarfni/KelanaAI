// ── Travel Style ──────────────────────────────────────────────
export const STYLE_ICONS: Record<string, string> = {
  Family: "👨‍👩‍👧‍👦",
  Solo: "🧳",
  Backpacker: "🎒",
  Couple: "💑",
  Luxury: "✨",
};

export const STYLE_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  Family: {
    label: "👨‍👩‍👧‍👦 Family",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  Solo: {
    label: "🧳 Solo",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
  },
  Backpacker: {
    label: "🎒 Backpacker",
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  Couple: {
    label: "💑 Couple",
    className: "bg-pink-50 text-pink-700 border border-pink-200",
  },
  Luxury: {
    label: "✨ Luxury",
    className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  },
};

// ── Category / Budget Tier ─────────────────────────────────────
export const CATEGORY_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  Backpacker: {
    label: "🎒 Backpacker",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  Standar: {
    label: "⭐ Standard",
    className: "bg-sky-50 text-sky-700 border border-sky-200",
  },
  Standard: {
    label: "⭐ Standard",
    className: "bg-sky-50 text-sky-700 border border-sky-200",
  },
  Luxury: {
    label: "💎 Luxury",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

// ── Destination flag lookup (country keyword → flag emoji) ─────
const DESTINATION_FLAGS: { keywords: string[]; flag: string }[] = [
  { keywords: ["japan", "tokyo", "osaka", "kyoto"], flag: "🇯🇵" },
  { keywords: ["bali", "indonesia", "jakarta", "bandung", "yogyakarta", "manado"], flag: "🇮🇩" },
  { keywords: ["paris", "france"], flag: "🇫🇷" },
  { keywords: ["london", "uk", "england", "britain"], flag: "🇬🇧" },
  { keywords: ["new york", "usa", "america", "los angeles", "chicago"], flag: "🇺🇸" },
  { keywords: ["sydney", "australia", "melbourne"], flag: "🇦🇺" },
  { keywords: ["singapore"], flag: "🇸🇬" },
  { keywords: ["bangkok", "thailand", "phuket", "chiang mai"], flag: "🇹🇭" },
  { keywords: ["korea", "seoul", "busan"], flag: "🇰🇷" },
  { keywords: ["china", "beijing", "shanghai"], flag: "🇨🇳" },
  { keywords: ["italy", "rome", "milan", "venice"], flag: "🇮🇹" },
  { keywords: ["spain", "barcelona", "madrid"], flag: "🇪🇸" },
  { keywords: ["vietnam", "hanoi", "ho chi minh"], flag: "🇻🇳" },
  { keywords: ["malaysia", "kuala lumpur", "penang"], flag: "🇲🇾" },
  { keywords: ["india", "delhi", "mumbai", "goa"], flag: "🇮🇳" },
  { keywords: ["dubai", "uae", "abu dhabi"], flag: "🇦🇪" },
  { keywords: ["turkey", "istanbul"], flag: "🇹🇷" },
  { keywords: ["greece", "athens", "santorini"], flag: "🇬🇷" },
  { keywords: ["netherlands", "amsterdam"], flag: "🇳🇱" },
  { keywords: ["germany", "berlin", "munich"], flag: "🇩🇪" },
  { keywords: ["switzerland", "zurich", "geneva"], flag: "🇨🇭" },
  { keywords: ["canada", "toronto", "vancouver"], flag: "🇨🇦" },
  { keywords: ["brazil", "rio"], flag: "🇧🇷" },
  { keywords: ["mexico", "cancun"], flag: "🇲🇽" },
  { keywords: ["egypt", "cairo"], flag: "🇪🇬" },
  { keywords: ["morocco", "marrakech"], flag: "🇲🇦" },
  { keywords: ["philippines", "manila", "cebu"], flag: "🇵🇭" },
  { keywords: ["cambodia", "siem reap", "phnom penh"], flag: "🇰🇭" },
  { keywords: ["maldives"], flag: "🇲🇻" },
  { keywords: ["new zealand", "auckland"], flag: "🇳🇿" },
];

export function getDestinationFlag(destination: string): string {
  const lower = destination.toLowerCase();
  for (const entry of DESTINATION_FLAGS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.flag;
    }
  }
  return "🌍";
}

// ── Currency formatter ─────────────────────────────────────────
export function formatBudget(amount: number): string {
  return `USD ${new Intl.NumberFormat("en-US").format(amount)}`;
}
