"use client";

import { Table } from "antd";
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

export default function DispatchesTable({ data = [], meta }) {
  const columns = [
    {
      title: "Report",
      key: "report",
      render: (_, record) => (
        <div>
          <p className="m-0 font-medium text-slate-800">
            {record?.report?.reportCode || "-"}
          </p>
          <p className="m-0 text-xs text-slate-500">
            {record?.report?.emergencyType
              ? formatText(record.report.emergencyType)
              : "-"}
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
      title: "Report Status",
      key: "reportStatus",
      render: (_, record) => <StatusBadge status={record?.report?.status} />,
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
            {record?.officer?.role ? formatText(record.officer.role) : "-"}
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
      title: "Assigned At",
      dataIndex: "assignedAt",
      key: "assignedAt",
      render: (value) => (
        <span className="text-slate-600">{formatDate(value)}</span>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      pagination={{
        current: meta?.page || 1,
        pageSize: meta?.limit || 10,
        total: meta?.totalItems || 0,
        showSizeChanger: false,
      }}
    />
  );
}
