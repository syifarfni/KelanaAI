import { getToken } from "@/services/AuthService";
import {
  Conversation,
  ConversationDetail,
  SendMessageResponse,
} from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

// ── Conversations ─────────────────────────────────────────────
export async function createConversation(): Promise<Conversation> {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await handleResponse<{
    conversation_id: number;
    title: string | null;
    created_at: string;
  }>(res);
  return { id: data.conversation_id, title: data.title, created_at: data.created_at };
}

export async function listConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/conversations`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return handleResponse<Conversation[]>(res);
}

export async function getConversationMessages(
  conversationId: number
): Promise<ConversationDetail> {
  const res = await fetch(`${API_URL}/api/v1/conversations/${conversationId}/messages`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return handleResponse<ConversationDetail>(res);
}

export async function renameConversation(
  conversationId: number,
  title: string
): Promise<Conversation> {
  const res = await fetch(`${API_URL}/api/v1/conversations/${conversationId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });
  return handleResponse<Conversation>(res);
}

export async function sendMessage(
  conversationId: number,
  question: string
): Promise<SendMessageResponse> {
  const res = await fetch(`${API_URL}/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question }),
  });
  return handleResponse<SendMessageResponse>(res);
}
