import { notFound, redirect } from "next/navigation";
import { Alert } from "antd";
import { apiFetch } from "@/lib/api";
import ReportDetailClientShell from "@/components/reports/report-detail-client-shell";

async function getReportDetail(id) {
  const result = await apiFetch(`/emergency-reports/${id}`);
  return result.data;
}

export default async function ReportDetailPage({ params }) {
  const resolvedParams = await params;
  const reportId = resolvedParams?.id;

  let report = null;
  let pageError = null;

  try {
    if (!reportId) {
      throw new Error("Report id is missing from route params");
    }

    report = await getReportDetail(reportId);
  } catch (error) {
    if (error.message === "SESSION_EXPIRED") {
      redirect("/login");
    }

    pageError = error.message || "Failed to load report detail";
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Report Detail</h1>
        <Alert
          type="error"
          showIcon
          title="Failed to load report detail"
          description={pageError}
        />
      </div>
    );
  }

  if (!report) {
    notFound();
  }

  return <ReportDetailClientShell report={report} />;
}
