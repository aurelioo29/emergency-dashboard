import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Alert } from "antd";
import { apiFetch } from "@/lib/api";
import OfficersTable from "@/components/officers/officers-table";

async function OfficersContent({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = resolvedSearchParams?.page || "1";
  const limit = resolvedSearchParams?.limit || "10";
  const status = resolvedSearchParams?.status || "";
  const role = resolvedSearchParams?.role || "";
  const isActive = resolvedSearchParams?.isActive || "";
  const search = resolvedSearchParams?.search || "";

  const query = new URLSearchParams({
    page,
    limit,
    ...(status ? { status } : {}),
    ...(role ? { role } : {}),
    ...(isActive ? { isActive } : {}),
    ...(search ? { search } : {}),
  });

  let result = null;
  let pageError = null;

  try {
    result = await apiFetch(`/officers?${query.toString()}`);
  } catch (error) {
    if (error.message === "SESSION_EXPIRED") {
      redirect("/login");
    }

    pageError = error.message || "Failed to load officers";
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Officers</h1>
        <Alert
          type="error"
          showIcon
          title="Failed to load officers"
          description={pageError}
        />
      </div>
    );
  }

  return <OfficersTable data={result.data} meta={result.meta} />;
}

export default async function OfficersPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading officers...</div>}>
      <OfficersContent searchParams={searchParams} />
    </Suspense>
  );
}