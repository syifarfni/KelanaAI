import {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Token helpers (localStorage) ─────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser): void {
  localStorage.setItem("access_token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ── API calls ─────────────────────────────────────────────────
export async function register(data: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Registration failed");
  }

  return res.json();
}

export async function login(data: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Login failed");
  }

  const result: LoginResponse = await res.json();
  saveSession(result.access_token, result.user);
  return result;
}

export function logout(): void {
  clearSession();
}
