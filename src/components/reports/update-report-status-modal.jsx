"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Select, Input, Button, message } from "antd";
import { clientApiFetch } from "@/lib/client-api";

export default function UpdateReportStatusModal({
  open,
  onClose,
  report,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      status: report?.status || undefined,
      notes: "",
    });
  }, [open, report, form]);

  const handleSubmit = async (values) => {
    if (!report?.id) {
      message.error("Report id is missing");
      return;
    }

    try {
      setLoading(true);

      await clientApiFetch(`/emergency-reports/${report.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: values.status,
          notes: values.notes || null,
        }),
      });

      message.success("Report status updated successfully");
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to update report status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Update Report Status"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Report Status"
          name="status"
          rules={[{ required: true, message: "Please select report status" }]}
        >
          <Select
            placeholder="Select report status"
            options={[
              { value: "REPORTED", label: "Reported" },
              { value: "ASSIGNED", label: "Assigned" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "ON_THE_WAY", label: "On The Way" },
              { value: "ARRIVED", label: "Arrived" },
              { value: "HANDLING", label: "Handling" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
              { value: "FAILED", label: "Failed" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea
            rows={4}
            placeholder="Optional note for this status update"
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Report
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
