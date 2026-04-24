"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Tooltip, Button, Modal, Switch, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { clientApiFetch } from "@/lib/client-api";
import { resolveFileUrl } from "@/lib/file-url";
import CreateServiceModal from "./create-service-modal";
import EditServiceModal from "./edit-service-modal";

function formatText(value) {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
}

function renderActiveTag(value) {
  if (value === true) return <Tag color="success">Active</Tag>;
  if (value === false) return <Tag color="default">Inactive</Tag>;
  return "-";
}

function ServiceIcon({ service }) {
  const iconUrl = resolveFileUrl(service?.iconUrl);

  if (iconUrl) {
    return (
      <div
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white"
        style={{
          backgroundColor: service?.colorHex || undefined,
        }}
      >
        <img
          src={iconUrl}
          alt={service?.serviceName || "Service icon"}
          className="h-7 w-7 object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
      style={{
        backgroundColor: service?.colorHex || "#F8FAFC",
      }}
    >
      {service?.iconName?.slice(0, 2)?.toUpperCase() ||
        service?.serviceCode?.slice(0, 2)?.toUpperCase() ||
        "SV"}
    </div>
  );
}

export default function ServicesTable({ data = [], meta }) {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const handleOpenEdit = (record) => {
    setSelectedService(record);
    setOpenEditModal(true);
  };

  const handleToggleActive = (record, checked) => {
    Modal.confirm({
      title: `${checked ? "Activate" : "Deactivate"} Service`,
      content: `Are you sure you want to ${
        checked ? "activate" : "deactivate"
      } ${record?.serviceName || "this service"}?`,
      okText: checked ? "Activate" : "Deactivate",
      okButtonProps: { danger: !checked },
      cancelText: "Cancel",
      async onOk() {
        try {
          setToggleLoadingId(record.id);

          await clientApiFetch(`/services/${record.id}/toggle-active`, {
            method: "PATCH",
            body: JSON.stringify({
              isActive: checked,
            }),
          });

          message.success(
            `Service ${checked ? "activated" : "deactivated"} successfully`,
          );

          window.location.reload();
        } catch (error) {
          message.error(error.message || "Failed to update service status");
        } finally {
          setToggleLoadingId(null);
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        title: "Service",
        key: "service",
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <ServiceIcon service={record} />

            <div>
              <p className="m-0 font-medium text-slate-900">
                {record?.serviceName || "-"}
              </p>
              <p className="m-0 text-xs text-slate-500">
                {record?.serviceCode || "-"}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        render: (value) => (
          <span className="text-slate-600">{value || "-"}</span>
        ),
      },
      {
        title: "Dispatch",
        key: "dispatch",
        render: (_, record) => (
          <div className="space-y-1">
            <Tag color={record?.requiresDispatch ? "processing" : "default"}>
              {record?.requiresDispatch ? "Required" : "Not Required"}
            </Tag>
            <p className="m-0 text-xs text-slate-500">
              {formatText(record?.autoAcceptMode)}
            </p>
          </div>
        ),
      },
      {
        title: "Timeout",
        dataIndex: "acceptTimeoutSeconds",
        key: "acceptTimeoutSeconds",
        render: (value, record) =>
          record?.requiresDispatch && record?.autoAcceptMode === "CONFIRM"
            ? `${value || 0}s`
            : "-",
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        render: (value) => renderActiveTag(value),
      },
      {
        title: "Action",
        key: "action",
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

          <Button type="primary" onClick={() => setOpenCreateModal(true)}>
            Add Service
          </Button>
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
