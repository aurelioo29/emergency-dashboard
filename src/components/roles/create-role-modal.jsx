"use client";

import { useState } from "react";
import { Modal, Form, Input, Switch, Button, message } from "antd";
import { clientApiFetch } from "@/lib/client-api";

export default function CreateRoleModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      await clientApiFetch("/roles", {
        method: "POST",
        body: JSON.stringify({
          roleName: values.roleName,
          roleCode: values.roleCode?.toUpperCase(),
          description: values.description || null,
          isActive: values.isActive,
        }),
      });

      message.success("Role created successfully");
      form.resetFields();
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Role"
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
          isActive: true,
        }}
      >
        <Form.Item
          label="Role Name"
          name="roleName"
          rules={[{ required: true, message: "Role name is required" }]}
        >
          <Input placeholder="Enter role name" />
        </Form.Item>

        <Form.Item
          label="Role Code"
          name="roleCode"
          rules={[{ required: true, message: "Role code is required" }]}
          extra="Use uppercase code like PARAMEDIC, DISPATCHER, SUPERVISOR"
        >
          <Input placeholder="Enter role code" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={3}
            placeholder="Enter role description (optional)"
          />
        </Form.Item>

        <Form.Item label="Active Role" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Role
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
