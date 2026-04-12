import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Alert } from "antd";
import { apiFetch } from "@/lib/api";
import HospitalsTable from "@/components/hospitals/hospitals-table";

async function HospitalsContent({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = resolvedSearchParams?.page || "1";
  const limit = resolvedSearchParams?.limit || "10";
  const search = resolvedSearchParams?.search || "";

  const query = new URLSearchParams({
    page,
    limit,
    ...(search ? { search } : {}),
  });

  let result = null;
  let pageError = null;

  try {
    result = await apiFetch(`/hospitals?${query.toString()}`);
  } catch (error) {
    if (error.message === "SESSION_EXPIRED") {
      redirect("/login");
    }

    pageError = error.message || "Failed to load hospitals";
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Hospitals</h1>
        <Alert
          type="error"
          showIcon
          title="Failed to load hospitals"
          description={pageError}
        />
      </div>
    );
  }

  return <HospitalsTable data={result.data} meta={result.meta} />;
}

export default async function HospitalsPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading hospitals...</div>}>
      <HospitalsContent searchParams={searchParams} />
    </Suspense>
  );
}
