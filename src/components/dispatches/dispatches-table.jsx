"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, Tag, Tooltip, Button, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import StatusBadge from "@/components/common/status-badge";
import UpdateDispatchStatusModal from "./update-dispatch-status-modal";
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

function renderAssignModeTag(record) {
  if (record?.autoAssigned === true) {
    return <Tag color="processing">Auto</Tag>;
  }

  if (record?.autoAssigned === false) {
    return <Tag color="default">Manual</Tag>;
  }

  return "-";
}

function mergeDispatchRow(existing, payload) {
  return {
    ...existing,
    id: payload.dispatchId || existing.id,
    dispatchStatus: payload.dispatchStatus ?? existing.dispatchStatus,
    autoAssigned:
      payload.autoAssigned !== undefined
        ? payload.autoAssigned
        : existing.autoAssigned,
    assignmentOrder: payload.assignmentOrder ?? existing.assignmentOrder,
    expiresAt: payload.expiresAt ?? existing.expiresAt,
    report: {
      ...existing.report,
      id: payload.reportId || existing?.report?.id,
      reportCode: payload.reportCode || existing?.report?.reportCode,
      status: payload.reportStatus || existing?.report?.status,
      service: payload.serviceId
        ? {
            ...existing?.report?.service,
            id: payload.serviceId,
            serviceCode:
              payload.serviceCode || existing?.report?.service?.serviceCode,
            serviceName:
              payload.serviceName || existing?.report?.service?.serviceName,
          }
        : existing?.report?.service,
    },
    service: payload.serviceId
      ? {
          ...existing.service,
          id: payload.serviceId,
          serviceCode: payload.serviceCode || existing?.service?.serviceCode,
          serviceName: payload.serviceName || existing?.service?.serviceName,
        }
      : existing.service,
    officer:
      payload.officerId || payload.officerName
        ? {
            ...existing.officer,
            id: payload.officerId ?? existing?.officer?.id,
            fullName: payload.officerName ?? existing?.officer?.fullName,
          }
        : existing.officer,
    ambulance:
      payload.ambulanceId !== undefined
        ? {
            ...existing.ambulance,
            id: payload.ambulanceId ?? existing?.ambulance?.id,
          }
        : existing.ambulance,
  };
}

export default function DispatchesTable({ data = [], meta }) {
  const [dispatches, setDispatches] = useState(data);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  useEffect(() => {
    setDispatches(data);
  }, [data]);

  const handleOpenUpdate = (record) => {
    setSelectedDispatch(record);
    setOpenUpdateModal(true);
  };

  useSocket({
    onDispatch: (payload) => {
      if (!payload?.dispatchId) return;

      setDispatches((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.id === payload.dispatchId,
        );

        if (existingIndex === -1) {
          const newRow = {
            id: payload.dispatchId,
            dispatchStatus: payload.dispatchStatus || "ASSIGNED",
            autoAssigned:
              payload.autoAssigned !== undefined ? payload.autoAssigned : false,
            assignmentOrder: payload.assignmentOrder || 1,
            expiresAt: payload.expiresAt || null,
            assignedAt: payload.updatedAt || new Date().toISOString(),
            report: {
              id: payload.reportId || null,
              reportCode: payload.reportCode || "-",
              status: payload.reportStatus || "ASSIGNED",
              service: payload.serviceId
                ? {
                    id: payload.serviceId,
                    serviceCode: payload.serviceCode || null,
                    serviceName: payload.serviceName || null,
                  }
                : null,
            },
            service: payload.serviceId
              ? {
                  id: payload.serviceId,
                  serviceCode: payload.serviceCode || null,
                  serviceName: payload.serviceName || null,
                }
              : null,
            officer: payload.officerId
              ? {
                  id: payload.officerId,
                  fullName: payload.officerName || "-",
                }
              : null,
            ambulance: payload.ambulanceId
              ? {
                  id: payload.ambulanceId,
                }
              : null,
          };

          message.success("🚑 Dispatch updated");
          return [newRow, ...prev];
        }

        const next = [...prev];
        next[existingIndex] = mergeDispatchRow(prev[existingIndex], payload);
        return next;
      });

      setSelectedDispatch((prev) => {
        if (!prev || prev.id !== payload.dispatchId) return prev;
        return mergeDispatchRow(prev, payload);
      });
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
              {record?.report?.reportCode || "-"}
            </p>
            <p className="m-0 text-xs text-slate-500">
              {record?.report?.service?.serviceName ||
                record?.service?.serviceName ||
                formatText(record?.report?.emergencyType) ||
                "-"}
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
        title: "Report Status",
        key: "reportStatus",
        render: (_, record) => <StatusBadge status={record?.report?.status} />,
      },
      {
        title: "Assign Mode",
        key: "assignMode",
        render: (_, record) => (
          <div className="space-y-1">
            {renderAssignModeTag(record)}
            <p className="m-0 text-xs text-slate-500">
              Order: {record?.assignmentOrder || 1}
            </p>
          </div>
        ),
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
        title: "Assigned At",
        dataIndex: "assignedAt",
        key: "assignedAt",
        render: (value) => (
          <span className="text-slate-600">{formatDate(value)}</span>
        ),
      },
      {
        title: "Expires At",
        dataIndex: "expiresAt",
        key: "expiresAt",
        render: (value) => (
          <span className="text-slate-600">{formatDate(value)}</span>
        ),
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Tooltip title="Update Status">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="!text-blue-500 hover:!text-blue-600"
              onClick={() => handleOpenUpdate(record)}
            />
          </Tooltip>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dispatches}
        pagination={{
          current: meta?.page || 1,
          pageSize: meta?.limit || 10,
          total: meta?.totalItems || 0,
          showSizeChanger: false,
        }}
      />

      <UpdateDispatchStatusModal
        open={openUpdateModal}
        onClose={() => {
          setOpenUpdateModal(false);
          setSelectedDispatch(null);
        }}
        dispatch={selectedDispatch}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
