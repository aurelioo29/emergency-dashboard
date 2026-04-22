import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Alert } from "antd";
import { apiFetch } from "@/lib/api";
import RolesTable from "@/components/roles/roles-table";

async function RolesContent({ searchParams }) {
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
    result = await apiFetch(`/roles?${query.toString()}`);
  } catch (error) {
    if (error.message === "SESSION_EXPIRED") {
      redirect("/login");
    }

    pageError = error.message || "Failed to load roles";
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
        <Alert
          type="error"
          showIcon
          title="Failed to load roles"
          description={pageError}
        />
      </div>
    );
  }

  return <RolesTable data={result.data} meta={result.meta} />;
}

export default async function RolesPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading roles...</div>}>
      <RolesContent searchParams={searchParams} />
    </Suspense>
  );
}
