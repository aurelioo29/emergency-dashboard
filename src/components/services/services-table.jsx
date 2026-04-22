"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Tooltip, Button, Modal, Switch, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { clientApiFetch } from "@/lib/client-api";
import MasterDataToolbar from "@/components/common/master-data-toolbar";
import CreateServiceModal from "./create-service-modal";
import EditServiceModal from "./edit-service-modal";

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

function renderActiveTag(value) {
  if (value === true) {
    return <Tag color="success">Active</Tag>;
  }

  if (value === false) {
    return <Tag color="default">Inactive</Tag>;
  }

  return "-";
}

function renderDispatchTag(value) {
  if (value === true) {
    return <Tag color="processing">Required</Tag>;
  }

  if (value === false) {
    return <Tag color="default">No Dispatch</Tag>;
  }

  return "-";
}

function renderModeTag(value) {
  const colorMap = {
    FULL_AUTO: "success",
    CONFIRM: "warning",
    MANUAL: "default",
  };

  const labelMap = {
    FULL_AUTO: "Full Auto",
    CONFIRM: "Confirm",
    MANUAL: "Manual",
  };

  return (
    <Tag color={colorMap[value] || "default"}>{labelMap[value] || "-"}</Tag>
  );
}

export default function ServicesTable({ data = [], meta }) {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const defaultVisibleColumns = [
    "serviceName",
    "requiresDispatch",
    "autoAcceptMode",
    "acceptTimeoutSeconds",
    "isActive",
    "createdAt",
    "action",
  ];

  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  const handleOpenEdit = (record) => {
    setSelectedService(record);
    setOpenEditModal(true);
  };

  const handleToggleActive = (record, checked) => {
    const nextActive = checked;

    Modal.confirm({
      title: `${nextActive ? "Activate" : "Deactivate"} Service`,
      content: `Are you sure you want to ${nextActive ? "activate" : "deactivate"} ${record?.serviceName || "this service"}?`,
      okText: nextActive ? "Activate" : "Deactivate",
      okButtonProps: {
        danger: !nextActive,
      },
      cancelText: "Cancel",
      async onOk() {
        try {
          setToggleLoadingId(record.id);

          await clientApiFetch(`/services/${record.id}/toggle-active`, {
            method: "PATCH",
            body: JSON.stringify({
              isActive: nextActive,
            }),
          });

          message.success(
            `Service ${nextActive ? "activated" : "deactivated"} successfully`,
          );

          window.location.reload();
        } catch (error) {
          message.error(
            error.message ||
              `Failed to ${nextActive ? "activate" : "deactivate"} service`,
          );
        } finally {
          setToggleLoadingId(null);
        }
      },
    });
  };

  const allColumns = useMemo(
    () => [
      {
        key: "serviceName",
        title: "Service",
        dataIndex: "serviceName",
        render: (value, record) => (
          <div>
            <p className="m-0 font-medium text-slate-900">{value || "-"}</p>
            <p className="m-0 text-xs text-slate-500">
              {record?.serviceCode || "-"}
            </p>
          </div>
        ),
      },
      {
        key: "requiresDispatch",
        title: "Dispatch",
        dataIndex: "requiresDispatch",
        render: (value) => renderDispatchTag(value),
      },
      {
        key: "autoAcceptMode",
        title: "Mode",
        dataIndex: "autoAcceptMode",
        render: (value) => renderModeTag(value),
      },
      {
        key: "acceptTimeoutSeconds",
        title: "Timeout",
        dataIndex: "acceptTimeoutSeconds",
        render: (value, record) => {
          if (!record?.requiresDispatch) return "-";
          if (record?.autoAcceptMode !== "CONFIRM") return "-";
          return `${value || 0} sec`;
        },
      },
      {
        key: "isActive",
        title: "Status",
        dataIndex: "isActive",
        render: (value) => renderActiveTag(value),
      },
      {
        key: "createdAt",
        title: "Created At",
        dataIndex: "createdAt",
        render: (value) => (
          <span className="text-slate-600">{formatDate(value)}</span>
        ),
      },
      {
        key: "action",
        title: "Action",
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                className="!text-blue-500 hover:!text-blue-600"
                onClick={() => handleOpenEdit(record)}
              />
            </Tooltip>

            <Tooltip title={record?.isActive ? "Deactivate" : "Activate"}>
              <Switch
                size="small"
                checked={!!record?.isActive}
                loading={toggleLoadingId === record.id}
                onChange={(checked) => handleToggleActive(record, checked)}
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [toggleLoadingId],
  );

  const columns = allColumns.filter((col) => visibleColumns.includes(col.key));

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-slate-900">Services</h1>
            <p className="m-0 text-sm text-slate-500">
              Manage dynamic emergency services and dispatch behavior.
            </p>
          </div>

          <MasterDataToolbar
            columns={allColumns}
            visibleColumns={visibleColumns}
            onChangeVisibleColumns={setVisibleColumns}
            onAddNew={() => setOpenCreateModal(true)}
            onRefresh={() => window.location.reload()}
          />
        </div>

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
      </div>

      <CreateServiceModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => window.location.reload()}
      />

      <EditServiceModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedService(null);
        }}
        service={selectedService}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
