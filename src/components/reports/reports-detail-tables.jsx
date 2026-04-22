"use client";

import { Table, Tag } from "antd";
import StatusBadge from "@/components/common/status-badge";

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

export default function ReportDetailTables({
  trackingLogs = [],
  dispatches = [],
}) {
  const trackingColumns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (value) => value || "-",
    },
    {
      title: "Updated By",
      dataIndex: "updatedByType",
      key: "updatedByType",
      render: (value) => (value ? <Tag>{formatText(value)}</Tag> : "-"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => formatDate(value),
    },
  ];

  const dispatchColumns = [
    {
      title: "Service",
      key: "service",
      render: (_, record) => (
        <div>
          <p className="m-0 font-medium text-slate-800">
            {record?.service?.serviceName ||
              record?.report?.service?.serviceName ||
              "-"}
          </p>
          <p className="m-0 text-xs text-slate-500">
            {record?.service?.serviceCode ||
              record?.report?.service?.serviceCode ||
              "-"}
          </p>
        </div>
      ),
    },
    {
      title: "Dispatch Status",
      dataIndex: "dispatchStatus",
      key: "dispatchStatus",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      title: "Officer",
      key: "officer",
      render: (_, record) => (
        <div>
          <p className="m-0 font-medium text-slate-800">
            {record?.officer?.fullName || "-"}
          </p>
          <p className="m-0 text-xs text-slate-500">
            {record?.officer?.roleDetail?.roleName ||
              formatText(record?.officer?.role) ||
              "-"}
          </p>
        </div>
      ),
    },
    {
      title: "Ambulance",
      key: "ambulance",
      render: (_, record) => (
        <div>
          <p className="m-0 font-medium text-slate-800">
            {record?.ambulance?.code || "-"}
          </p>
          <p className="m-0 text-xs text-slate-500">
            {record?.ambulance?.plateNumber || "-"}
          </p>
        </div>
      ),
    },
    {
      title: "Assign Mode",
      key: "assignMode",
      render: (_, record) => (
        <div>
          <Tag color={record?.autoAssigned ? "processing" : "default"}>
            {record?.autoAssigned ? "Auto" : "Manual"}
          </Tag>
          <p className="m-0 text-xs text-slate-500">
            Order: {record?.assignmentOrder || 1}
          </p>
        </div>
      ),
    },
    {
      title: "Assigned At",
      dataIndex: "assignedAt",
      key: "assignedAt",
      render: (value) => formatDate(value),
    },
    {
      title: "Expires At",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (value) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-6">
      <div
        id="tracking-logs-section"
        className="border border-slate-200 bg-white"
      >
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="m-0 text-base font-semibold text-slate-800">
            Tracking Logs
          </h2>
        </div>

        <div className="p-4">
          <Table
            rowKey="id"
            columns={trackingColumns}
            dataSource={trackingLogs}
            pagination={false}
          />
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="m-0 text-base font-semibold text-slate-800">
            Dispatch Information
          </h2>
        </div>

        <div className="p-4">
          <Table
            rowKey="id"
            columns={dispatchColumns}
            dataSource={dispatches}
            pagination={false}
          />
        </div>
      </div>
    </div>
  );
}
