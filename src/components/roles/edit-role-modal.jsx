"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, Button, message } from "antd";
import { clientApiFetch } from "@/lib/client-api";

export default function EditRoleModal({ open, onClose, role, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && role) {
      form.setFieldsValue({
        roleName: role.roleName || "",
        roleCode: role.roleCode || "",
        description: role.description || "",
        isActive: role.isActive ?? true,
      });
    } else {
      form.resetFields();
    }
  }, [open, role, form]);

  const handleSubmit = async (values) => {
    if (!role?.id) {
      message.error("Role id is missing");
      return;
    }

    try {
      setLoading(true);

      await clientApiFetch(`/roles/${role.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          roleName: values.roleName,
          roleCode: values.roleCode?.toUpperCase(),
          description: values.description || null,
          isActive: values.isActive,
        }),
      });

      message.success("Role updated successfully");
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Role"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
            Update Role
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
