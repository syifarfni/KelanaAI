import { Trip, CreateTripPayload } from "@/types/trip";
import { getToken } from "@/services/AuthService";

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
    const detail = err.detail;
    if (Array.isArray(detail)) {
      throw new Error(detail.map((d: { msg: string }) => d.msg).join(", "));
    }
    throw new Error(typeof detail === "string" ? detail : `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getTrips(): Promise<Trip[]> {
  const res = await fetch(`${API_URL}/api/v1/trips`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return handleResponse<Trip[]>(res);
}

export async function getTrip(id: number): Promise<Trip> {
  const res = await fetch(`${API_URL}/api/v1/trips/${id}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return handleResponse<Trip>(res);
}

export async function createTrip(data: CreateTripPayload): Promise<Trip> {
  const res = await fetch(`${API_URL}/api/v1/trips`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Trip>(res);
}

export async function generateRecommendation(tripId: number): Promise<Trip> {
  const res = await fetch(`${API_URL}/api/v1/trips/${tripId}/generate`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<Trip>(res);
}
