"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Tooltip, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import StatusBadge from "@/components/common/status-badge";
import UpdateDispatchStatusModal from "./update-dispatch-status-modal";

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

export default function DispatchesTable({ data = [], meta }) {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  const handleOpenUpdate = (record) => {
    setSelectedDispatch(record);
    setOpenUpdateModal(true);
  };

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
        dataSource={data}
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
