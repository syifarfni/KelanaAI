import { Trip, CreateTripPayload } from "@/types/trip";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTrips(): Promise<Trip[]> {
  const res = await fetch(`${API_URL}/trips`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
}

export async function getTrip(id: number): Promise<Trip> {
  const res = await fetch(`${API_URL}/trips/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch trip ${id}`);
  return res.json();
}

export async function createTrip(data: CreateTripPayload): Promise<Trip> {
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    const detail = err.detail;
    if (Array.isArray(detail)) {
      throw new Error(detail.map((d: { msg: string }) => d.msg).join(", "));
    }
    throw new Error(typeof detail === "string" ? detail : "Failed to create trip");
  }
  return res.json();
}

export async function generateRecommendation(tripId: number): Promise<Trip> {
  const res = await fetch(`${API_URL}/trips/${tripId}/generate`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to generate recommendation");
  return res.json();
}
