"use client";

import Link from "next/link";
import { Table, Button, Space, Tag } from "antd";
import { DeploymentUnitOutlined } from "@ant-design/icons";
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

function renderDispatchModeTag(service) {
  if (!service) return <Tag color="default">Unknown</Tag>;
  if (service.requiresDispatch === false) {
    return <Tag color="default">No Dispatch</Tag>;
  }

  const mode = service.autoAcceptMode || "MANUAL";
  const colorMap = {
    FULL_AUTO: "success",
    CONFIRM: "warning",
    MANUAL: "processing",
  };

  return <Tag color={colorMap[mode] || "default"}>{formatText(mode)}</Tag>;
}

export default function ReportTable({ data = [], meta }) {
  const columns = [
    {
      title: "Report",
      key: "report",
      render: (_, record) => (
        <div>
          <p className="m-0 font-medium text-slate-800">
            {record?.reportCode || "-"}
          </p>
          <p className="m-0 text-xs text-slate-500">
            {record?.user?.fullName || "-"}
          </p>
        </div>
      ),
    },
    {
      title: "Service",
      key: "service",
      render: (_, record) => (
        <div>
          <p className="m-0 font-medium text-slate-800">
            {record?.service?.serviceName ||
              formatText(record?.emergencyType) ||
              "-"}
          </p>
          <p className="m-0 text-xs text-slate-500">
            {record?.service?.serviceCode || "-"}
          </p>
        </div>
      ),
    },
    {
      title: "Dispatch Mode",
      key: "dispatchMode",
      render: (_, record) => (
        <div className="space-y-1">
          {renderDispatchModeTag(record?.service)}
          <p className="m-0 text-xs text-slate-500">
            {record?.service?.requiresDispatch ? "Requires dispatch" : "No dispatch needed"}
          </p>
        </div>
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
      title: "Nearest Hospital",
      key: "nearestHospital",
      render: (_, record) => (
        <div>
          <p className="m-0 font-medium text-slate-800">
            {record?.nearestHospital?.hospitalName || "-"}
          </p>
          <p className="m-0 text-xs text-slate-500">
            {record?.nearestHospital?.phoneNumber || "-"}
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

          {record?.service?.requiresDispatch === true &&
          !["COMPLETED", "CANCELLED", "FAILED"].includes(record?.status) ? (
            <Link href={`/dashboard/reports/${record.id}`}>
              <Button
                type="link"
                icon={<DeploymentUnitOutlined />}
                className="!px-0"
              >
                Dispatch
              </Button>
            </Link>
          ) : null}
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