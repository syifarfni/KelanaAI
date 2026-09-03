export interface Conversation {
  id: number;
  title: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ConversationDetail {
  conversation_id: number;
  title: string | null;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  conversation_id: number;
  title: string | null;
  user_message: ChatMessage;
  ai_message: ChatMessage;
}
