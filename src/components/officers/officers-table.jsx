"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Tooltip, Button, Modal, Switch, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { clientApiFetch } from "@/lib/client-api";
import MasterDataToolbar from "@/components/common/master-data-toolbar";
import CreateOfficerModal from "./create-officer-modal";
import EditOfficerModal from "./edit-officer-modal";
import ManageOfficerServicesModal from "./manage-officer-services-modal";

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

function renderActiveTag(value) {
  if (value === true) {
    return <Tag color="success">Active</Tag>;
  }

  if (value === false) {
    return <Tag color="default">Inactive</Tag>;
  }

  return "-";
}

function renderStatusTag(status) {
  const colorMap = {
    AVAILABLE: "success",
    ON_DUTY: "processing",
    OFFLINE: "default",
  };

  return <Tag color={colorMap[status] || "default"}>{formatText(status)}</Tag>;
}

function renderServiceTags(officerServices = []) {
  if (!Array.isArray(officerServices) || officerServices.length === 0) {
    return <span className="text-slate-400">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {officerServices.slice(0, 3).map((item) => {
        const name = item?.service?.serviceName || item?.serviceName || "-";
        const isPrimary = item?.isPrimary === true;

        return (
          <Tag
            key={item.id || `${name}-${Math.random()}`}
            color={isPrimary ? "blue" : "default"}
          >
            {name}
            {isPrimary ? " (Primary)" : ""}
          </Tag>
        );
      })}

      {officerServices.length > 3 ? (
        <Tag color="default">+{officerServices.length - 3} more</Tag>
      ) : null}
    </div>
  );
}

export default function OfficersTable({ data = [], meta }) {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openManageServicesModal, setOpenManageServicesModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const defaultVisibleColumns = [
    "fullName",
    "phoneNumber",
    "role",
    "status",
    "assignedServices",
    "isActive",
    "lastLoginAt",
    "createdAt",
    "action",
  ];

  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  const handleOpenEdit = (record) => {
    setSelectedOfficer(record);
    setOpenEditModal(true);
  };

  const handleOpenManageServices = (record) => {
    setSelectedOfficer(record);
    setOpenManageServicesModal(true);
  };

  const handleToggleActive = (record, checked) => {
    const nextActive = checked;

    Modal.confirm({
      title: `${nextActive ? "Activate" : "Deactivate"} Officer`,
      content: `Are you sure you want to ${nextActive ? "activate" : "deactivate"} ${record?.fullName || "this officer"}?`,
      okText: nextActive ? "Activate" : "Deactivate",
      okButtonProps: {
        danger: !nextActive,
      },
      cancelText: "Cancel",
      async onOk() {
        try {
          setToggleLoadingId(record.id);

          await clientApiFetch(`/officers/${record.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              isActive: nextActive,
            }),
          });

          message.success(
            `Officer ${nextActive ? "activated" : "deactivated"} successfully`,
          );

          window.location.reload();
        } catch (error) {
          message.error(
            error.message ||
              `Failed to ${nextActive ? "activate" : "deactivate"} officer`,
          );
        } finally {
          setToggleLoadingId(null);
        }
      },
      onCancel() {},
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Officer",
      content: `Are you sure you want to delete ${record?.fullName || "this officer"}? This action cannot be undone.`,
      okText: "Delete",
      okButtonProps: {
        danger: true,
      },
      cancelText: "Cancel",
      async onOk() {
        try {
          setDeleteLoadingId(record.id);

          await clientApiFetch(`/officers/${record.id}`, {
            method: "DELETE",
          });

          message.success("Officer deleted successfully");
          window.location.reload();
        } catch (error) {
          message.error(error.message || "Failed to delete officer");
        } finally {
          setDeleteLoadingId(null);
        }
      },
    });
  };

  const allColumns = useMemo(
    () => [
      {
        key: "fullName",
        title: "Full Name",
        dataIndex: "fullName",
        render: (value, record) => (
          <div>
            <p className="m-0 font-medium text-slate-900">{value || "-"}</p>
            <p className="m-0 text-xs text-slate-500">{record?.email || "-"}</p>
          </div>
        ),
      },
      {
        key: "phoneNumber",
        title: "Phone Number",
        dataIndex: "phoneNumber",
        render: (value) => value || "-",
      },
      {
        key: "role",
        title: "Role",
        dataIndex: "role",
        render: (value) => (
          <span className="font-medium text-slate-700">
            {formatText(value)}
          </span>
        ),
      },
      {
        key: "status",
        title: "Operational Status",
        dataIndex: "status",
        render: (value) => renderStatusTag(value),
      },
      {
        key: "assignedServices",
        title: "Assigned Services",
        render: (_, record) => renderServiceTags(record?.officerServices || []),
      },
      {
        key: "isActive",
        title: "Account",
        dataIndex: "isActive",
        render: (value) => renderActiveTag(value),
      },
      {
        key: "lastLoginAt",
        title: "Last Login",
        dataIndex: "lastLoginAt",
        render: (value) => (
          <span className="text-slate-600">{formatDate(value)}</span>
        ),
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
            <Tooltip title="Manage Services">
              <Button
                type="text"
                icon={<AppstoreOutlined />}
                className="!text-violet-500 hover:!text-violet-600"
                onClick={() => handleOpenManageServices(record)}
              />
            </Tooltip>

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
            <h1 className="mb-1 text-2xl font-bold text-slate-900">Officers</h1>
            <p className="m-0 text-sm text-slate-500">
              Monitor officer accounts, roles, service assignments, and
              operational readiness.
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

      <CreateOfficerModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => window.location.reload()}
      />

      <EditOfficerModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedOfficer(null);
        }}
        officer={selectedOfficer}
        onSuccess={() => window.location.reload()}
      />

      <ManageOfficerServicesModal
        open={openManageServicesModal}
        onClose={() => {
          setOpenManageServicesModal(false);
          setSelectedOfficer(null);
        }}
        officer={selectedOfficer}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
