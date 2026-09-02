"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthUser } from "@/types/auth";

interface NavbarProps {
  user: AuthUser | null;
  onSignOut: () => void;
}

const NAV_LINKS = [
  { href: "/", label: "✈ Planner" },
  { href: "/trips", label: "🕘 History" },
  { href: "/chat", label: "💬 Chat AI" },
];

export default function Navbar({ user, onSignOut }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-[#3d4a2e] border-b border-[#4e5e38]">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-white font-bold text-lg shrink-0"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Kelana<span className="text-[#c8d4a0]">AI</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#ffffff22] text-white"
                    : "text-[#a8b890] hover:text-white hover:bg-[#ffffff12]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User + Sign out */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-[#c8d4a0]">👤 {user?.name}</span>
          <button
            onClick={onSignOut}
            className="text-xs text-[#a8b890] hover:text-white transition-colors cursor-pointer border-l border-[#ffffff22] pl-3"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
