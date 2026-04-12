import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import ReportTable from "@/components/reports/reports-table";

async function ReportsContent({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  
  const page = resolvedSearchParams?.page || "1";
  const limit = resolvedSearchParams?.limit || "10";
  const status = resolvedSearchParams?.status || "";
  const emergencyType = resolvedSearchParams?.emergencyType || "";
  const search = resolvedSearchParams?.search || "";

  const query = new URLSearchParams({
    page,
    limit,
    ...(status ? { status } : {}),
    ...(emergencyType ? { emergencyType } : {}),
    ...(search ? { search } : {}),
  });

  const result = await apiFetch(`/emergency-reports?${query.toString()}`);

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">
          Emergency Reports
        </h1>
        <p className="m-0 text-sm text-slate-500">
          Monitor incoming emergency reports from users.
        </p>
      </div>

      <ReportTable data={result.data} meta={result.meta} />
    </div>
  );
}

export default async function ReportsPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <ReportsContent searchParams={searchParams} />
    </Suspense>
  );
}
