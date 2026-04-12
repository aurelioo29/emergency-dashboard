"use client";

import { useMemo, useState } from "react";
import { Table, Tooltip, Button, Modal, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { clientApiFetch } from "@/lib/client-api";
import MasterDataToolbar from "@/components/common/master-data-toolbar";
import CreateHospitalModal from "./create-hospital-modal";
import EditHospitalModal from "./edit-hospital-modal";

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

export default function HospitalsTable({ data = [], meta }) {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const defaultVisibleColumns = [
    "hospitalName",
    "address",
    "phoneNumber",
    "latitude",
    "longitude",
    "createdAt",
    "action",
  ];

  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  const handleOpenEdit = (record) => {
    setSelectedHospital(record);
    setOpenEditModal(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Hospital",
      content: `Are you sure you want to delete ${record?.hospitalName || "this hospital"}? This action cannot be undone.`,
      okText: "Delete",
      okButtonProps: {
        danger: true,
      },
      cancelText: "Cancel",
      async onOk() {
        try {
          setDeleteLoadingId(record.id);

          await clientApiFetch(`/hospitals/${record.id}`, {
            method: "DELETE",
          });

          message.success("Hospital deleted successfully");
          window.location.reload();
        } catch (error) {
          message.error(error.message || "Failed to delete hospital");
        } finally {
          setDeleteLoadingId(null);
        }
      },
    });
  };

  const allColumns = useMemo(
    () => [
      {
        key: "hospitalName",
        title: "Hospital Name",
        dataIndex: "hospitalName",
        render: (value) => (
          <span className="font-medium text-slate-900">{value || "-"}</span>
        ),
      },
      {
        key: "address",
        title: "Address",
        dataIndex: "address",
        render: (value) => value || "-",
      },
      {
        key: "phoneNumber",
        title: "Phone Number",
        dataIndex: "phoneNumber",
        render: (value) => value || "-",
      },
      {
        key: "latitude",
        title: "Latitude",
        dataIndex: "latitude",
        render: (value) => value ?? "-",
      },
      {
        key: "longitude",
        title: "Longitude",
        dataIndex: "longitude",
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
    [deleteLoadingId],
  );

  const columns = allColumns.filter((col) => visibleColumns.includes(col.key));

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-slate-900">
              Hospitals
            </h1>
            <p className="m-0 text-sm text-slate-500">
              Monitor hospitals and destination references for emergency
              response.
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

      <CreateHospitalModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => window.location.reload()}
      />

      <EditHospitalModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedHospital(null);
        }}
        hospital={selectedHospital}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
