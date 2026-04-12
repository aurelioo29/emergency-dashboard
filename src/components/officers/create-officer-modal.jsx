"use client";

import { useState } from "react";
import { Modal, Form, Input, Select, Switch, Button, message } from "antd";
import { clientApiFetch } from "@/lib/client-api";

export default function CreateOfficerModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      await clientApiFetch("/officers", {
        method: "POST",
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          role: values.role,
          status: values.status,
          isActive: values.isActive,
          password: values.password,
        }),
      });

      message.success("Officer created successfully");
      form.resetFields();
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to create officer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Officer"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "AVAILABLE",
          isActive: true,
        }}
      >
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
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Password is required" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password placeholder="Enter password" />
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
            Save Officer
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
