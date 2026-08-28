export interface Trip {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  travel_style: string;
  daily_budget: number;
  ai_recommendation: string | null;
  created_at: string;
}

export interface CreateTripPayload {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
}
