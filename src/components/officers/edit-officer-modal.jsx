"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Switch, Button, message } from "antd";
import { clientApiFetch } from "@/lib/client-api";

export default function EditOfficerModal({
  open,
  onClose,
  officer,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && officer) {
      form.setFieldsValue({
        fullName: officer.fullName || "",
        email: officer.email || "",
        phoneNumber: officer.phoneNumber || "",
        role: officer.role || undefined,
        status: officer.status || "AVAILABLE",
        isActive: officer.isActive ?? true,
        password: "",
      });
    } else {
      form.resetFields();
    }
  }, [open, officer, form]);

  const handleSubmit = async (values) => {
    if (!officer?.id) {
      message.error("Officer id is missing");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: values.role,
        status: values.status,
        isActive: values.isActive,
      };

      if (values.password) {
        payload.password = values.password;
      }

      await clientApiFetch(`/officers/${officer.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      message.success("Officer updated successfully");
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to update officer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Officer"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: "Full name is required" }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Email format is invalid" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[{ required: true, message: "Phone number is required" }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Role is required" }]}
        >
          <Select
            placeholder="Select role"
            options={[
              { value: "PARAMEDIC", label: "Paramedic" },
              { value: "AMBULANCE_DRIVER", label: "Ambulance Driver" },
              { value: "FIRE_OFFICER", label: "Fire Officer" },
              { value: "POLICE_OFFICER", label: "Police Officer" },
              { value: "FIELD_RESPONDER", label: "Field Responder" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Operational Status"
          name="status"
          rules={[{ required: true, message: "Status is required" }]}
        >
          <Select
            placeholder="Select status"
            options={[
              { value: "AVAILABLE", label: "Available" },
              { value: "ON_DUTY", label: "On Duty" },
              { value: "BUSY", label: "Busy" },
              { value: "OFFLINE", label: "Offline" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="password"
          extra="Leave empty if you do not want to change the password."
          rules={[
            {
              min: 6,
              message: "Password must be at least 6 characters",
            },
          ]}
        >
          <Input.Password placeholder="Enter new password (optional)" />
        </Form.Item>

        <Form.Item
          label="Active Account"
          name="isActive"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Officer
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
