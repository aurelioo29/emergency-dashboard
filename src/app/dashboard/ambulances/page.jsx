import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Alert } from "antd";
import { apiFetch } from "@/lib/api";
import AmbulancesTable from "@/components/ambulances/ambulances-table";

async function AmbulancesContent({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = resolvedSearchParams?.page || "1";
  const limit = resolvedSearchParams?.limit || "10";
  const status = resolvedSearchParams?.status || "";
  const search = resolvedSearchParams?.search || "";

  const query = new URLSearchParams({
    page,
    limit,
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  });

  let result = null;
  let pageError = null;

  try {
    result = await apiFetch(`/ambulances?${query.toString()}`);
  } catch (error) {
    if (error.message === "SESSION_EXPIRED") {
      redirect("/login");
    }

    pageError = error.message || "Failed to load ambulances";
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Ambulances</h1>
        <Alert
          type="error"
          showIcon
          title="Failed to load ambulances"
          description={pageError}
        />
      </div>
    );
  }

  return <AmbulancesTable data={result.data} meta={result.meta} />;
}

export default async function AmbulancesPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading ambulances...</div>}>
      <AmbulancesContent searchParams={searchParams} />
    </Suspense>
  );
}
