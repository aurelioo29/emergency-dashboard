import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Alert } from "antd";
import { apiFetch } from "@/lib/api";
import ReportTable from "@/components/reports/reports-table";

async function ReportsContent({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = resolvedSearchParams?.page || "1";
  const limit = resolvedSearchParams?.limit || "10";
  const status = resolvedSearchParams?.status || "";
  const serviceId = resolvedSearchParams?.serviceId || "";
  const emergencyType = resolvedSearchParams?.emergencyType || "";
  const search = resolvedSearchParams?.search || "";

  const query = new URLSearchParams({
    page,
    limit,
    ...(status ? { status } : {}),
    ...(serviceId ? { serviceId } : {}),
    ...(emergencyType ? { emergencyType } : {}),
    ...(search ? { search } : {}),
  });

  let result = null;
  let pageError = null;

  try {
    result = await apiFetch(`/emergency-reports?${query.toString()}`);
  } catch (error) {
    if (error.message === "SESSION_EXPIRED") {
      redirect("/login");
    }

    pageError = error.message || "Failed to load emergency reports";
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Emergency Reports</h1>
        <Alert
          type="error"
          showIcon
          title="Failed to load emergency reports"
          description={pageError}
        />
      </div>
    );
  }

  return <ReportTable data={result.data} meta={result.meta} />;
}

export default async function ReportsPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <ReportsContent searchParams={searchParams} />
    </Suspense>
  );
}
