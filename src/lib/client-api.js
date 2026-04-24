"use client";

import { getSession } from "next-auth/react";

export async function clientApiFetch(path, options = {}) {
  const session = await getSession();

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {}),

    ...(isFormData ? {} : { "Content-Type": "application/json" }),

    ...(options.headers || {}),
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}
