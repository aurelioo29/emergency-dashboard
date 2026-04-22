"use client";

import { useMemo, useState } from "react";
import { Alert, message, Tag } from "antd";
import ReportDetailActions from "./report-detail-actions";
import AssignDispatchModal from "@/components/dispatches/assign-dispatch-modal";
import UpdateReportStatusModal from "./update-report-status-modal";
import UpdateDispatchStatusModal from "@/components/dispatches/update-dispatch-status-modal";
import StatusBadge from "@/components/common/status-badge";

function formatText(value) {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
}

export default function ReportDetailHeader({ report }) {
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openReportStatusModal, setOpenReportStatusModal] = useState(false);
  const [openDispatchStatusModal, setOpenDispatchStatusModal] = useState(false);

  const latestDispatch = useMemo(() => {
    if (!report?.dispatches?.length) return null;
    return report.dispatches[0];
  }, [report]);

  const hasDispatch =
    Array.isArray(report?.dispatches) && report.dispatches.length > 0;

  const handleAssignDispatch = () => {
    setOpenAssignModal(true);
  };

  const handleUpdateReportStatus = () => {
    setOpenReportStatusModal(true);
  };

  const handleUpdateDispatchStatus = () => {
    if (!latestDispatch) {
      message.warning("No dispatch found for this report yet");
      return;
    }

    setOpenDispatchStatusModal(true);
  };

  const handleDelete = () => {
    message.warning(
      `Delete action for report ${report?.id} is not implemented yet`,
    );
  };

  const handleViewLogs = () => {
    const section = document.getElementById("tracking-logs-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      message.info("Tracking logs section not found");
    }
  };

  return (
    <>
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="m-0 text-2xl font-bold text-slate-900">
              {report?.reportCode || "Report Detail"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {report?.service?.serviceName ||
                formatText(report?.emergencyType) ||
                "-"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report?.status} />
            {report?.service?.serviceCode ? (
              <Tag color="default">{report.service.serviceCode}</Tag>
            ) : null}
            {report?.service?.autoAcceptMode ? (
              <Tag color="processing">
                {formatText(report.service.autoAcceptMode)}
              </Tag>
            ) : null}
          </div>
        </div>

        {!hasDispatch && report?.service?.requiresDispatch === true ? (
          <Alert
            type="warning"
            showIcon
            message="No dispatch assigned yet"
            description="This report still does not have a dispatch assignment. Assign manually or verify auto-assign behavior."
          />
        ) : null}

        <ReportDetailActions
          report={report}
          onAssignDispatch={handleAssignDispatch}
          onUpdateReportStatus={handleUpdateReportStatus}
          onUpdateDispatchStatus={handleUpdateDispatchStatus}
          onDelete={handleDelete}
          onViewLogs={handleViewLogs}
        />
      </div>

      <AssignDispatchModal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        reportId={report?.id}
        onSuccess={() => window.location.reload()}
      />

      <UpdateReportStatusModal
        open={openReportStatusModal}
        onClose={() => setOpenReportStatusModal(false)}
        report={report}
        onSuccess={() => window.location.reload()}
      />

      <UpdateDispatchStatusModal
        open={openDispatchStatusModal}
        onClose={() => setOpenDispatchStatusModal(false)}
        dispatch={latestDispatch}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
