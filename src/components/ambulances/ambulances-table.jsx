"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Tooltip, Button, Modal, Switch, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { clientApiFetch } from "@/lib/client-api";
import MasterDataToolbar from "@/components/common/master-data-toolbar";
import CreateAmbulanceModal from "./create-ambulance-modal";
import EditAmbulanceModal from "./edit-ambulance-modal";

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

function renderStatusTag(status) {
  const colorMap = {
    AVAILABLE: "success",
    DISPATCHED: "processing",
    MAINTENANCE: "warning",
    INACTIVE: "default",
  };

  return <Tag color={colorMap[status] || "default"}>{formatText(status)}</Tag>;
}

export default function AmbulancesTable({ data = [], meta }) {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const defaultVisibleColumns = [
    "code",
    "plateNumber",
    "name",
    "status",
    "currentLatitude",
    "currentLongitude",
    "createdAt",
    "action",
  ];

  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  const handleOpenEdit = (record) => {
    setSelectedAmbulance(record);
    setOpenEditModal(true);
  };

  const handleToggleActive = (record, checked) => {
    const nextStatus = checked ? "AVAILABLE" : "INACTIVE";

    Modal.confirm({
      title: `${checked ? "Activate" : "Deactivate"} Ambulance`,
      content: `Are you sure you want to ${checked ? "activate" : "deactivate"} ${record?.name || "this ambulance"}?`,
      okText: checked ? "Activate" : "Deactivate",
      okButtonProps: {
        danger: !checked,
      },
      cancelText: "Cancel",
      async onOk() {
        try {
          setToggleLoadingId(record.id);

          await clientApiFetch(`/ambulances/${record.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              status: nextStatus,
            }),
          });

          message.success(
            `Ambulance ${checked ? "activated" : "deactivated"} successfully`,
          );

          window.location.reload();
        } catch (error) {
          message.error(
            error.message ||
              `Failed to ${checked ? "activate" : "deactivate"} ambulance`,
          );
        } finally {
          setToggleLoadingId(null);
        }
      },
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Ambulance",
      content: `Are you sure you want to delete ${record?.name || "this ambulance"}? This action cannot be undone.`,
      okText: "Delete",
      okButtonProps: {
        danger: true,
      },
      cancelText: "Cancel",
      async onOk() {
        try {
          setDeleteLoadingId(record.id);

          await clientApiFetch(`/ambulances/${record.id}`, {
            method: "DELETE",
          });

          message.success("Ambulance deleted successfully");
          window.location.reload();
        } catch (error) {
          message.error(error.message || "Failed to delete ambulance");
        } finally {
          setDeleteLoadingId(null);
        }
      },
    });
  };

  const allColumns = useMemo(
    () => [
      {
        key: "code",
        title: "Code",
        dataIndex: "code",
        render: (value) => (
          <span className="font-medium text-slate-900">{value || "-"}</span>
        ),
      },
      {
        key: "plateNumber",
        title: "Plate Number",
        dataIndex: "plateNumber",
        render: (value) => value || "-",
      },
      {
        key: "name",
        title: "Name",
        dataIndex: "name",
        render: (value) => value || "-",
      },
      {
        key: "status",
        title: "Status",
        dataIndex: "status",
        render: (value) => renderStatusTag(value),
      },
      {
        key: "currentLatitude",
        title: "Current Latitude",
        dataIndex: "currentLatitude",
        render: (value) => value ?? "-",
      },
      {
        key: "currentLongitude",
        title: "Current Longitude",
        dataIndex: "currentLongitude",
        render: (value) => value ?? "-",
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

            <Tooltip
              title={record?.status === "INACTIVE" ? "Activate" : "Deactivate"}
            >
              <Switch
                size="small"
                checked={record?.status !== "INACTIVE"}
                loading={toggleLoadingId === record.id}
                onChange={(checked) => handleToggleActive(record, checked)}
              />
            </Tooltip>

            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoadingId === record.id}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [toggleLoadingId, deleteLoadingId],
  );

  const columns = allColumns.filter((col) => visibleColumns.includes(col.key));

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-slate-900">
              Ambulances
            </h1>
            <p className="m-0 text-sm text-slate-500">
              Monitor ambulance units, status, and vehicle readiness.
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

      <CreateAmbulanceModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => window.location.reload()}
      />

      <EditAmbulanceModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedAmbulance(null);
        }}
        ambulance={selectedAmbulance}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
