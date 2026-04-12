"use client";

import Link from "next/link";
import { Table, Button, Space } from "antd";
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

export default function ReportTable({ data = [], meta }) {
  const columns = [
    {
      title: "Report Code",
      dataIndex: "reportCode",
      key: "reportCode",
      render: (value) => (
        <span className="font-medium text-slate-800">{value}</span>
      ),
    },
    {
      title: "Emergency Type",
      dataIndex: "emergencyType",
      key: "emergencyType",
      render: (value) => (
        <span className="font-medium text-slate-700">
          {String(value || "").replaceAll("_", " ")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      title: "Requester",
      dataIndex: ["user", "fullName"],
      key: "user",
      render: (_, record) => (
        <div>
          <p className="m-0 font-medium text-slate-800">
            {record?.user?.fullName || "-"}
          </p>
          <p className="m-0 text-xs text-slate-500">
            {record?.user?.phoneNumber || "-"}
          </p>
        </div>
      ),
    },
    {
      title: "Requested At",
      dataIndex: "requestedAt",
      key: "requestedAt",
      render: (value) => (
        <span className="text-slate-600">{formatDate(value)}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Link href={`/dashboard/reports/${record.id}`}>
            <Button type="link" className="!px-0">
              Detail
            </Button>
          </Link>
        </Space>
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
