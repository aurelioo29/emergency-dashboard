"use client";

import { getSession, signOut } from "next-auth/react";

export async function clientApiFetch(path, options = {}) {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error("No access token found");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
    ...(options.headers || {}),
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (res.status === 401) {
    await signOut({ callbackUrl: "/login" });
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
