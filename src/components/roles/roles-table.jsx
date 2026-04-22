"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Tooltip, Button, Modal, Switch, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { clientApiFetch } from "@/lib/client-api";
import MasterDataToolbar from "@/components/common/master-data-toolbar";
import CreateRoleModal from "./create-role-modal";
import EditRoleModal from "./edit-role-modal";

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

export default function RolesTable({ data = [], meta }) {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const defaultVisibleColumns = [
    "roleName",
    "description",
    "isActive",
    "createdAt",
    "action",
  ];

  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  const handleOpenEdit = (record) => {
    setSelectedRole(record);
    setOpenEditModal(true);
  };

  const handleToggleActive = (record, checked) => {
    const nextActive = checked;

    Modal.confirm({
      title: `${nextActive ? "Activate" : "Deactivate"} Role`,
      content: `Are you sure you want to ${nextActive ? "activate" : "deactivate"} ${record?.roleName || "this role"}?`,
      okText: nextActive ? "Activate" : "Deactivate",
      okButtonProps: {
        danger: !nextActive,
      },
      cancelText: "Cancel",
      async onOk() {
        try {
          setToggleLoadingId(record.id);

          await clientApiFetch(`/roles/${record.id}/toggle-active`, {
            method: "PATCH",
            body: JSON.stringify({
              isActive: nextActive,
            }),
          });

          message.success(
            `Role ${nextActive ? "activated" : "deactivated"} successfully`,
          );

          window.location.reload();
        } catch (error) {
          message.error(
            error.message ||
              `Failed to ${nextActive ? "activate" : "deactivate"} role`,
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
        key: "roleName",
        title: "Role",
        dataIndex: "roleName",
        render: (value, record) => (
          <div>
            <p className="m-0 font-medium text-slate-900">{value || "-"}</p>
            <p className="m-0 text-xs text-slate-500">
              {record?.roleCode || "-"}
            </p>
          </div>
        ),
      },
      {
        key: "description",
        title: "Description",
        dataIndex: "description",
        render: (value) => (
          <span className="text-slate-600">{value || "-"}</span>
        ),
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
            <h1 className="mb-1 text-2xl font-bold text-slate-900">Roles</h1>
            <p className="m-0 text-sm text-slate-500">
              Manage dynamic officer roles used across the emergency system.
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

      <CreateRoleModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => window.location.reload()}
      />

      <EditRoleModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
