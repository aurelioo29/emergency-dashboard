"use client";

import { useMemo, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  message,
  InputNumber,
} from "antd";
import { clientApiFetch } from "@/lib/client-api";

const AUTO_ACCEPT_OPTIONS = [
  { value: "FULL_AUTO", label: "Full Auto" },
  { value: "CONFIRM", label: "Confirm" },
  { value: "MANUAL", label: "Manual" },
];

export default function CreateServiceModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const requiresDispatch = Form.useWatch("requiresDispatch", form);
  const autoAcceptMode = Form.useWatch("autoAcceptMode", form);

  const timeoutDisabled = useMemo(() => {
    return !requiresDispatch || autoAcceptMode !== "CONFIRM";
  }, [requiresDispatch, autoAcceptMode]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        serviceName: values.serviceName,
        serviceCode: values.serviceCode?.toUpperCase(),
        description: values.description || null,
        iconName: values.iconName || null,
        colorHex: values.colorHex || null,
        requiresDispatch: values.requiresDispatch,
        autoAcceptMode: values.requiresDispatch
          ? values.autoAcceptMode
          : "MANUAL",
        acceptTimeoutSeconds:
          values.requiresDispatch && values.autoAcceptMode === "CONFIRM"
            ? values.acceptTimeoutSeconds || 15
            : 0,
        isActive: values.isActive,
      };

      await clientApiFetch("/services", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      message.success("Service created successfully");
      form.resetFields();
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Service"
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
          requiresDispatch: true,
          autoAcceptMode: "CONFIRM",
          acceptTimeoutSeconds: 15,
          isActive: true,
        }}
      >
        <Form.Item
          label="Service Name"
          name="serviceName"
          rules={[{ required: true, message: "Service name is required" }]}
        >
          <Input placeholder="Enter service name" />
        </Form.Item>

        <Form.Item
          label="Service Code"
          name="serviceCode"
          rules={[{ required: true, message: "Service code is required" }]}
          extra="Use uppercase code like AMBULANCE, FIRE, POLICE"
        >
          <Input placeholder="Enter service code" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={3}
            placeholder="Enter service description (optional)"
          />
        </Form.Item>

        <Form.Item label="Icon Name" name="iconName">
          <Input placeholder="Enter icon name (optional)" />
        </Form.Item>

        <Form.Item label="Color Hex" name="colorHex">
          <Input placeholder="Enter color hex (optional), e.g. #EF4444" />
        </Form.Item>

        <Form.Item
          label="Requires Dispatch"
          name="requiresDispatch"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Auto Accept Mode"
          name="autoAcceptMode"
          rules={[
            {
              required: !!requiresDispatch,
              message: "Auto accept mode is required",
            },
          ]}
        >
          <Select
            placeholder="Select mode"
            options={AUTO_ACCEPT_OPTIONS}
            disabled={!requiresDispatch}
          />
        </Form.Item>

        <Form.Item
          label="Accept Timeout (seconds)"
          name="acceptTimeoutSeconds"
          rules={[
            {
              validator: async (_, value) => {
                if (!requiresDispatch || autoAcceptMode !== "CONFIRM") return;
                if (value === undefined || value === null) {
                  throw new Error("Timeout is required for confirm mode");
                }
                if (value < 1) {
                  throw new Error("Timeout must be greater than 0");
                }
              },
            },
          ]}
        >
          <InputNumber
            min={0}
            max={3600}
            className="!w-full"
            disabled={timeoutDisabled}
            placeholder="Enter timeout in seconds"
          />
        </Form.Item>

        <Form.Item
          label="Active Service"
          name="isActive"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Service
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
