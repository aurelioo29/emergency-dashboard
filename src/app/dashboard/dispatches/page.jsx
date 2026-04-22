import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Alert } from "antd";
import { apiFetch } from "@/lib/api";
import DispatchesTable from "@/components/dispatches/dispatches-table";

async function DispatchesContent({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = resolvedSearchParams?.page || "1";
  const limit = resolvedSearchParams?.limit || "10";
  const dispatchStatus = resolvedSearchParams?.dispatchStatus || "";
  const reportId = resolvedSearchParams?.reportId || "";
  const officerId = resolvedSearchParams?.officerId || "";
  const ambulanceId = resolvedSearchParams?.ambulanceId || "";
  const serviceId = resolvedSearchParams?.serviceId || "";

  const query = new URLSearchParams({
    page,
    limit,
    ...(dispatchStatus ? { dispatchStatus } : {}),
    ...(reportId ? { reportId } : {}),
    ...(officerId ? { officerId } : {}),
    ...(ambulanceId ? { ambulanceId } : {}),
    ...(serviceId ? { serviceId } : {}),
  });

  let result = null;
  let pageError = null;

  try {
    result = await apiFetch(`/dispatches?${query.toString()}`);
  } catch (error) {
    if (error.message === "SESSION_EXPIRED") {
      redirect("/login");
    }

    pageError = error.message || "Failed to load dispatches";
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Dispatches</h1>
        <Alert
          type="error"
          showIcon
          title="Failed to load dispatches"
          description={pageError}
        />
      </div>
    );
  }

  return <DispatchesTable data={result.data} meta={result.meta} />;
}

export default async function DispatchesPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading dispatches...</div>}>
      <DispatchesContent searchParams={searchParams} />
    </Suspense>
  );
}
