"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Select, Input, Button, message, Spin } from "antd";
import { clientApiFetch } from "@/lib/client-api";

export default function AssignDispatchModal({
  open,
  onClose,
  reportId,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [ambulances, setAmbulances] = useState([]);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      try {
        setFetchingOptions(true);

        const [officerRes, ambulanceRes] = await Promise.all([
          clientApiFetch("/officers?page=1&limit=100"),
          clientApiFetch("/ambulances?page=1&limit=100"),
        ]);

        const officerItems = (officerRes.data || []).filter(
          (item) => item.isActive && item.status === "AVAILABLE",
        );

        const ambulanceItems = (ambulanceRes.data || []).filter(
          (item) => item.status === "AVAILABLE",
        );

        setOfficers(officerItems);
        setAmbulances(ambulanceItems);
      } catch (error) {
        message.error(error.message || "Failed to load options");
      } finally {
        setFetchingOptions(false);
      }
    };

    loadOptions();
  }, [open]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      await clientApiFetch("/dispatches", {
        method: "POST",
        body: JSON.stringify({
          reportId,
          officerId: values.officerId || null,
          ambulanceId: values.ambulanceId || null,
          notes: values.notes || null,
        }),
      });

      message.success("Dispatch assigned successfully");
      form.resetFields();
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to assign dispatch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Assign Dispatch"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {fetchingOptions ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Officer"
            name="officerId"
            rules={[{ required: true, message: "Please select an officer" }]}
          >
            <Select
              placeholder="Select officer"
              options={officers.map((item) => ({
                value: item.id,
                label: `${item.fullName} — ${item.role}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Ambulance"
            name="ambulanceId"
            rules={[{ required: true, message: "Please select an ambulance" }]}
          >
            <Select
              placeholder="Select ambulance"
              options={ambulances.map((item) => ({
                value: item.id,
                label: `${item.code} — ${item.plateNumber || "-"}`,
              }))}
            />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea
              rows={4}
              placeholder="Optional notes for dispatch"
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Assign
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}
