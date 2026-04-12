"use client";

import { useMemo, useState } from "react";
import { message } from "antd";
import ReportDetailActions from "./report-detail-actions";
import AssignDispatchModal from "@/components/dispatches/assign-dispatch-modal";
import UpdateReportStatusModal from "./update-report-status-modal";
import UpdateDispatchStatusModal from "@/components/dispatches/update-dispatch-status-modal";

export default function ReportDetailHeader({ report }) {
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openReportStatusModal, setOpenReportStatusModal] = useState(false);
  const [openDispatchStatusModal, setOpenDispatchStatusModal] = useState(false);

  const latestDispatch = useMemo(() => {
    if (!report?.dispatches?.length) return null;
    return report.dispatches[0];
  }, [report]);

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
      <ReportDetailActions
        onAssignDispatch={handleAssignDispatch}
        onUpdateReportStatus={handleUpdateReportStatus}
        onUpdateDispatchStatus={handleUpdateDispatchStatus}
        onDelete={handleDelete}
        onViewLogs={handleViewLogs}
      />

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
