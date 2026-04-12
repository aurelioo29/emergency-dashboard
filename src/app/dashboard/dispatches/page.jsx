import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import DispatchesTable from "@/components/dispatches/dispatches-table";

async function DispatchesContent({ searchParams }) {
  const page = searchParams?.page || "1";
  const limit = searchParams?.limit || "10";
  const dispatchStatus = searchParams?.dispatchStatus || "";
  const reportId = searchParams?.reportId || "";
  const officerId = searchParams?.officerId || "";
  const ambulanceId = searchParams?.ambulanceId || "";

  const query = new URLSearchParams({
    page,
    limit,
    ...(dispatchStatus ? { dispatchStatus } : {}),
    ...(reportId ? { reportId } : {}),
    ...(officerId ? { officerId } : {}),
    ...(ambulanceId ? { ambulanceId } : {}),
  });

  const result = await apiFetch(`/dispatches?${query.toString()}`);

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Dispatches</h1>
        <p className="m-0 text-sm text-slate-500">
          Monitor all dispatch assignments and response progress.
        </p>
      </div>

      <DispatchesTable data={result.data} meta={result.meta} />
    </div>
  );
}

export default async function DispatchesPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading dispatches...</div>}>
      <DispatchesContent searchParams={searchParams} />
    </Suspense>
  );
}
