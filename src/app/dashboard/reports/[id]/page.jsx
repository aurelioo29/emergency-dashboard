import { notFound, redirect } from "next/navigation";
import { Descriptions, Alert } from "antd";
import { apiFetch } from "@/lib/api";
import StatusBadge from "@/components/common/status-badge";
import ReportDetailTables from "@/components/reports/reports-detail-tables";
import ReportDetailHeader from "@/components/reports/report-detail-header";

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatText(value) {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
}

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

  return (
    <div className="space-y-6">
      <ReportDetailHeader report={report} />

      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">
          Report Detail
        </h1>
        <p className="m-0 text-sm text-slate-500">
          Full information for emergency report {report.reportCode}.
        </p>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="m-0 text-base font-semibold text-slate-800">
            Report Information
          </h2>
        </div>

        <div className="p-4">
          <Descriptions column={2} bordered size="middle">
            <Descriptions.Item label="Report Code">
              {report.reportCode || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <StatusBadge status={report.status} />
            </Descriptions.Item>

            <Descriptions.Item label="Emergency Type">
              {formatText(report.emergencyType)}
            </Descriptions.Item>
            <Descriptions.Item label="Requested At">
              {formatDate(report.requestedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Description" span={2}>
              {report.description || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Address Snapshot" span={2}>
              {report.addressSnapshot || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Latitude">
              {report.latitude ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Longitude">
              {report.longitude ?? "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Assigned At">
              {formatDate(report.assignedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Arrived At">
              {formatDate(report.arrivedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Completed At">
              {formatDate(report.completedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Nearest Hospital">
              {report?.nearestHospital?.hospitalName || "-"}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="m-0 text-base font-semibold text-slate-800">
            Requester Information
          </h2>
        </div>

        <div className="p-4">
          <Descriptions column={2} bordered size="middle">
            <Descriptions.Item label="Full Name">
              {report?.user?.fullName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number">
              {report?.user?.phoneNumber || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="NIK">
              {report?.user?.nik || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {report?.user?.address || "-"}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <ReportDetailTables
        trackingLogs={report.trackingLogs || []}
        dispatches={report.dispatches || []}
      />
    </div>
  );
}
