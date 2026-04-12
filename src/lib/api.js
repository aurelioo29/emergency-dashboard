import { getAuthSession } from "@/lib/session";

export async function apiFetch(path, options = {}) {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("SESSION_EXPIRED");
  }

  if (session.error === "RefreshAccessTokenError") {
    throw new Error("SESSION_EXPIRED");
  }

  if (!session.accessToken) {
    throw new Error("SESSION_EXPIRED");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
    ...(options.headers || {}),
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await res.json();

  if (res.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
