"use client";

import useJoinReport from "@/hooks/useJoinReport";
import useSocket from "@/hooks/useSocket";

export default function ReportDetailRealtime({
  reportId,
  onLocationUpdate,
  onReportUpdate,
  onDispatchUpdate,
}) {
  useJoinReport(reportId);

  useSocket({
    onReport: (data) => {
      if (data?.reportId === reportId || data?.id === reportId) {
        onReportUpdate?.(data);
      }
    },
    onDispatch: (data) => {
      if (data?.reportId === reportId) {
        onDispatchUpdate?.(data);
      }
    },
    onLocation: (data) => {
      if (data?.reportId === reportId) {
        onLocationUpdate?.(data);
      }
    },
  });

  return null;
}
