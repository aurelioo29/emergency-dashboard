"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Table, Button, message, Space, Tag } from "antd";
import { DeploymentUnitOutlined } from "@ant-design/icons";
import StatusBadge from "@/components/common/status-badge";
import useSocket from "@/hooks/useSocket";

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

function mergeReportRow(existing, incoming) {
  return {
    ...existing,
    ...incoming,
    user: incoming?.user
      ? { ...existing?.user, ...incoming.user }
      : existing?.user,
    service: incoming?.service
      ? { ...existing?.service, ...incoming.service }
      : existing?.service,
    nearestHospital: incoming?.nearestHospital
      ? { ...existing?.nearestHospital, ...incoming.nearestHospital }
      : existing?.nearestHospital,
  };
}

export default function ReportTable({ data = [], meta }) {
  const [reports, setReports] = useState(data);

  useEffect(() => {
    setReports(data);
  }, [data]);

  useSocket({
    onReport: (payload) => {
      if (!payload) return;

      const reportId = payload.id || payload.reportId;

      setReports((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === reportId);

        if (existingIndex === -1) {
          const newRow = {
            id: payload.id || payload.reportId,
            reportCode: payload.reportCode || "-",
            status: payload.status || "REPORTED",
            latitude: payload.latitude ?? null,
            longitude: payload.longitude ?? null,
            requestedAt: payload.requestedAt || new Date().toISOString(),
            service: payload.serviceId
              ? {
                  id: payload.serviceId,
                  serviceName: payload.serviceName || null,
                  serviceCode: payload.serviceCode || null,
                  requiresDispatch:
                    payload.requiresDispatch !== undefined
                      ? payload.requiresDispatch
                      : true,
                  autoAcceptMode: payload.autoAcceptMode || null,
                }
              : null,
            user: payload.userId
              ? {
                  id: payload.userId,
                  fullName: payload.userName || "-",
                  phoneNumber: payload.userPhoneNumber || "-",
                }
              : null,
            nearestHospital: null,
          };

          message.warning("🚨 New Emergency Report");
          return [newRow, ...prev];
        }

        const next = [...prev];
        next[existingIndex] = mergeReportRow(prev[existingIndex], {
          id: reportId,
          reportCode: payload.reportCode,
          status: payload.status,
          assignedAt: payload.assignedAt,
          acceptedAt: payload.acceptedAt,
          arrivedAt: payload.arrivedAt,
          completedAt: payload.completedAt,
          cancelledAt: payload.cancelledAt,
          failedAt: payload.failedAt,
          service: payload.serviceId
            ? {
                id: payload.serviceId,
                serviceName: payload.serviceName,
                serviceCode: payload.serviceCode,
                requiresDispatch: payload.requiresDispatch,
                autoAcceptMode: payload.autoAcceptMode,
              }
            : undefined,
        });

        return next;
      });
    },

    onDispatch: (payload) => {
      if (!payload?.reportId) return;

      setReports((prev) =>
        prev.map((item) => {
          if (item.id !== payload.reportId) return item;

          return mergeReportRow(item, {
            status: payload.reportStatus || item.status,
            assignedAt:
              payload.reportStatus === "ASSIGNED"
                ? payload.updatedAt || new Date().toISOString()
                : item.assignedAt,
            acceptedAt:
              payload.reportStatus === "ACCEPTED"
                ? payload.updatedAt || new Date().toISOString()
                : item.acceptedAt,
            arrivedAt:
              payload.reportStatus === "ARRIVED"
                ? payload.updatedAt || new Date().toISOString()
                : item.arrivedAt,
            completedAt:
              payload.reportStatus === "COMPLETED"
                ? payload.updatedAt || new Date().toISOString()
                : item.completedAt,
            service: payload.serviceId
              ? {
                  ...item?.service,
                  id: payload.serviceId,
                  serviceName:
                    payload.serviceName || item?.service?.serviceName,
                  serviceCode:
                    payload.serviceCode || item?.service?.serviceCode,
                }
              : item.service,
          });
        }),
      );
    },
  });

  const columns = useMemo(
    () => [
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
              {record?.service?.requiresDispatch
                ? "Requires dispatch"
                : "No dispatch needed"}
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
    ],
    [],
  );

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={reports}
      pagination={{
        current: meta?.page || 1,
        pageSize: meta?.limit || 10,
        total: meta?.totalItems || 0,
        showSizeChanger: false,
      }}
    />
  );
}
