"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/types/auth";
import { getUser, isLoggedIn, logout } from "@/services/AuthService";

interface UseAuthReturn {
  user: AuthUser | null;
  ready: boolean;
  signOut: () => void;
}

/**
 * Reusable auth guard hook.
 * - Redirects to /login if the user is not authenticated.
 * - Returns the current user and a ready flag (false during the auth check).
 * - Provides a signOut helper that clears the session and redirects.
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setUser(getUser());
    setReady(true);
  }, [router]);

  function signOut() {
    logout();
    router.replace("/login");
  }

  return { user, ready, signOut };
}
