"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Select, Input, Button, message } from "antd";
import { clientApiFetch } from "@/lib/client-api";

export default function UpdateDispatchStatusModal({
  open,
  onClose,
  dispatch,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      dispatchStatus: dispatch?.dispatchStatus || undefined,
      notes: "",
    });
  }, [open, dispatch, form]);

  const handleSubmit = async (values) => {
    if (!dispatch?.id) {
      message.error("Dispatch id is missing");
      return;
    }

    try {
      setLoading(true);

      await clientApiFetch(`/dispatches/${dispatch.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          dispatchStatus: values.dispatchStatus,
          notes: values.notes || null,
        }),
      });

      message.success("Dispatch status updated successfully");
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to update dispatch status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Update Dispatch Status"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Dispatch Status"
          name="dispatchStatus"
          rules={[{ required: true, message: "Please select dispatch status" }]}
        >
          <Select
            placeholder="Select dispatch status"
            options={[
              { value: "ASSIGNED", label: "Assigned" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "ON_THE_WAY", label: "On The Way" },
              { value: "ARRIVED", label: "Arrived" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea
            rows={4}
            placeholder="Optional note for this dispatch update"
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Dispatch
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
