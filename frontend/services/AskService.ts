import { getToken } from "@/services/AuthService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AskResponse {
  question: string;
  answer: string;
  documents: string[];
}

export async function askAI(question: string): Promise<AskResponse> {
  const token = getToken();
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Request failed (${res.status})`);
  }

  return res.json();
}
