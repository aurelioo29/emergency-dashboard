"use client";

import Link from "next/link";
import { Button } from "antd";
import {
  ArrowLeftOutlined,
  PlusCircleOutlined,
  EditOutlined,
  DeliveredProcedureOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

export default function ReportDetailActions({
  report,
  onAssignDispatch,
  onUpdateReportStatus,
  onUpdateDispatchStatus,
  onDelete,
  onViewLogs,
}) {
  const btnClass = "!px-0 text-sm";

  const canAssignDispatch =
    report?.service?.requiresDispatch === true &&
    !["COMPLETED", "CANCELLED", "FAILED"].includes(report?.status);

  const canUpdateDispatch =
    Array.isArray(report?.dispatches) && report.dispatches.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-4 py-3">
      <Link href="/dashboard/reports">
        <Button type="link" icon={<ArrowLeftOutlined />} className={btnClass}>
          Back to List
        </Button>
      </Link>

      {canAssignDispatch ? (
        <Button
          type="link"
          icon={<PlusCircleOutlined />}
          className={btnClass}
          onClick={onAssignDispatch}
        >
          Assign Dispatch
        </Button>
      ) : null}

      <Button
        type="link"
        icon={<EditOutlined />}
        className={btnClass}
        onClick={onUpdateReportStatus}
      >
        Update Report Status
      </Button>

      {canUpdateDispatch ? (
        <Button
          type="link"
          icon={<DeliveredProcedureOutlined />}
          className={btnClass}
          onClick={onUpdateDispatchStatus}
        >
          Update Dispatch Status
        </Button>
      ) : null}

      <Button
        type="link"
        icon={<ClockCircleOutlined />}
        className={btnClass}
        onClick={() => window.location.reload()}
      >
        Refresh
      </Button>

      <Button
        danger
        type="link"
        icon={<DeleteOutlined />}
        className={btnClass}
        onClick={onDelete}
      >
        Delete
      </Button>

      <Button
        type="link"
        icon={<HistoryOutlined />}
        className={btnClass}
        onClick={onViewLogs}
      >
        Tracking Logs
      </Button>
    </div>
  );
}
