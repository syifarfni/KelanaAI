"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/services/AuthService";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-[#f4f1e8] flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* Logo */}
      <Link href="/" className="mb-8 text-center">
        <h1
          className="text-3xl font-bold text-[#3d4a2e]"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Kelana<span className="text-[#7a8c5e]">AI</span>
        </h1>
        <p className="text-xs text-[#8a9070] mt-1">AI-Powered Travel Planner</p>
      </Link>

      <div className="w-full max-w-sm bg-white border border-[#e0ddd0] rounded-3xl shadow-md p-8">
        <h2
          className="text-xl font-bold text-[#2e3a20] mb-1"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Welcome back
        </h2>
        <p className="text-sm text-[#8a9070] mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6b7a50] uppercase tracking-widest">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-[#d0cdb8] rounded-xl px-4 py-2.5 text-sm text-[#2e3a20] bg-[#fafaf5] placeholder-[#b0b49a] focus:outline-none focus:ring-2 focus:ring-[#6b7a50] focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6b7a50] uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-[#d0cdb8] rounded-xl px-4 py-2.5 text-sm text-[#2e3a20] bg-[#fafaf5] placeholder-[#b0b49a] focus:outline-none focus:ring-2 focus:ring-[#6b7a50] focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-[#3d4a2e] hover:bg-[#2e3820] disabled:bg-[#9aaa80] text-white font-semibold rounded-xl py-3 text-sm transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#8a9070] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#5a6e42] font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
