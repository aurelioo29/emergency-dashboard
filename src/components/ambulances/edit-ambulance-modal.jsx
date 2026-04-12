"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, Button, message } from "antd";
import { clientApiFetch } from "@/lib/client-api";

export default function EditAmbulanceModal({
  open,
  onClose,
  ambulance,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (ambulance) {
      form.setFieldsValue({
        code: ambulance.code || "",
        name: ambulance.name || "",
        plateNumber: ambulance.plateNumber || "",
        status: ambulance.status || "AVAILABLE",
        currentLatitude: ambulance.currentLatitude ?? null,
        currentLongitude: ambulance.currentLongitude ?? null,
      });
    } else {
      form.resetFields();
    }
  }, [open, ambulance, form]);

  const handleSubmit = async (values) => {
    if (!ambulance?.id) {
      message.error("Ambulance id is missing");
      return;
    }

    try {
      setLoading(true);

      await clientApiFetch(`/ambulances/${ambulance.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          code: values.code,
          name: values.name,
          plateNumber: values.plateNumber,
          status: values.status,
          currentLatitude: values.currentLatitude ?? null,
          currentLongitude: values.currentLongitude ?? null,
        }),
      });

      message.success("Ambulance updated successfully");
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to update ambulance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Ambulance"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Code"
          name="code"
          rules={[{ required: true, message: "Code is required" }]}
        >
          <Input placeholder="Enter ambulance code" />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Enter ambulance name" />
        </Form.Item>

        <Form.Item
          label="Plate Number"
          name="plateNumber"
          rules={[{ required: true, message: "Plate number is required" }]}
        >
          <Input placeholder="Enter plate number" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Status is required" }]}
        >
          <Select
            options={[
              { value: "AVAILABLE", label: "Available" },
              { value: "DISPATCHED", label: "Dispatched" },
              { value: "MAINTENANCE", label: "Maintenance" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Current Latitude" name="currentLatitude">
          <InputNumber className="!w-full" placeholder="Enter latitude" />
        </Form.Item>

        <Form.Item label="Current Longitude" name="currentLongitude">
          <InputNumber className="!w-full" placeholder="Enter longitude" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Ambulance
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
