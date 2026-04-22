import { notFound, redirect } from "next/navigation";
import { Descriptions, Alert, Tag } from "antd";
import { apiFetch } from "@/lib/api";
import StatusBadge from "@/components/common/status-badge";
import ReportDetailTables from "@/components/reports/reports-detail-tables";
import ReportDetailHeader from "@/components/reports/report-detail-header";
import ReportLocationMap from "@/components/reports/report-location-map";
import ReportPhotoPreview from "@/components/reports/report-photo-preview";

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

            <Descriptions.Item label="Service">
              <div className="space-y-1">
                <div>
                  {report?.service?.serviceName ||
                    formatText(report?.emergencyType)}
                </div>
                {report?.service?.serviceCode ? (
                  <Tag color="default">{report.service.serviceCode}</Tag>
                ) : null}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Requested At">
              {formatDate(report.requestedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Dispatch Mode">
              {report?.service?.requiresDispatch ? (
                <Tag color="processing">
                  {formatText(report?.service?.autoAcceptMode || "MANUAL")}
                </Tag>
              ) : (
                <Tag color="default">No Dispatch</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nearest Hospital">
              {report?.nearestHospital?.hospitalName || "-"}
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
            <Descriptions.Item label="Accepted At">
              {formatDate(report.acceptedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Arrived At">
              {formatDate(report.arrivedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Completed At">
              {formatDate(report.completedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Cancelled At">
              {formatDate(report.cancelledAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Failed At">
              {formatDate(report.failedAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="m-0 text-base font-semibold text-slate-800">
              Report Location Map
            </h2>
          </div>

          <div className="p-4">
            <ReportLocationMap
              latitude={report.latitude}
              longitude={report.longitude}
              addressSnapshot={report.addressSnapshot}
            />
          </div>
        </div>

        <div className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="m-0 text-base font-semibold text-slate-800">
              Report Photo
            </h2>
          </div>

          <div className="p-4">
            <ReportPhotoPreview
              photoUrl={report.photoUrl}
              reportCode={report.reportCode}
            />
          </div>
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
