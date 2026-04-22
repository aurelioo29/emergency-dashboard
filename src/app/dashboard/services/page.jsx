import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Alert } from "antd";
import { apiFetch } from "@/lib/api";
import ServicesTable from "@/components/services/services-table";

async function ServicesContent({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = resolvedSearchParams?.page || "1";
  const limit = resolvedSearchParams?.limit || "10";
  const isActive = resolvedSearchParams?.isActive || "";
  const search = resolvedSearchParams?.search || "";

  const query = new URLSearchParams({
    page,
    limit,
    ...(isActive ? { isActive } : {}),
    ...(search ? { search } : {}),
  });

  let result = null;
  let pageError = null;

  try {
    result = await apiFetch(`/services?${query.toString()}`);
  } catch (error) {
    if (error.message === "SESSION_EXPIRED") {
      redirect("/login");
    }

    pageError = error.message || "Failed to load services";
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Services</h1>
        <Alert
          type="error"
          showIcon
          title="Failed to load services"
          description={pageError}
        />
      </div>
    );
  }

  return <ServicesTable data={result.data} meta={result.meta} />;
}

export default async function ServicesPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading services...</div>}>
      <ServicesContent searchParams={searchParams} />
    </Suspense>
  );
}
