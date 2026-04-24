"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  message,
  InputNumber,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { clientApiFetch } from "@/lib/client-api";
import { resolveFileUrl } from "@/lib/file-url";

const AUTO_ACCEPT_OPTIONS = [
  { value: "FULL_AUTO", label: "Full Auto" },
  { value: "CONFIRM", label: "Confirm" },
  { value: "MANUAL", label: "Manual" },
];

export default function EditServiceModal({
  open,
  onClose,
  service,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const requiresDispatch = Form.useWatch("requiresDispatch", form);
  const autoAcceptMode = Form.useWatch("autoAcceptMode", form);

  const timeoutDisabled = useMemo(() => {
    return !requiresDispatch || autoAcceptMode !== "CONFIRM";
  }, [requiresDispatch, autoAcceptMode]);

  useEffect(() => {
    if (open && service) {
      form.setFieldsValue({
        serviceName: service.serviceName || "",
        serviceCode: service.serviceCode || "",
        description: service.description || "",
        iconName: service.iconName || "",
        icon: service.iconUrl
          ? [
              {
                uid: "-1",
                name: "current-icon",
                status: "done",
                url: resolveFileUrl(service.iconUrl),
              },
            ]
          : [],
        colorHex: service.colorHex || "",
        requiresDispatch: service.requiresDispatch ?? true,
        autoAcceptMode: service.autoAcceptMode || "CONFIRM",
        acceptTimeoutSeconds: service.acceptTimeoutSeconds ?? 15,
        isActive: service.isActive ?? true,
      });
    } else {
      form.resetFields();
    }
  }, [open, service, form]);

  const handleSubmit = async (values) => {
    if (!service?.id) {
      message.error("Service id is missing");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("serviceName", values.serviceName);
      formData.append("serviceCode", values.serviceCode?.toUpperCase());
      formData.append("description", values.description || "");
      formData.append("iconName", values.iconName || "");
      formData.append("colorHex", values.colorHex || "");
      formData.append("requiresDispatch", String(values.requiresDispatch));
      formData.append(
        "autoAcceptMode",
        values.requiresDispatch ? values.autoAcceptMode : "MANUAL",
      );
      formData.append(
        "acceptTimeoutSeconds",
        String(
          values.requiresDispatch && values.autoAcceptMode === "CONFIRM"
            ? values.acceptTimeoutSeconds || 15
            : 0,
        ),
      );
      formData.append("isActive", String(values.isActive));

      const iconFile = values.icon?.find(
        (file) => file.originFileObj,
      )?.originFileObj;

      if (iconFile) {
        formData.append("icon", iconFile);
      }

      await clientApiFetch(`/services/${service.id}`, {
        method: "PATCH",
        body: formData,
      });

      message.success("Service updated successfully");
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to update service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Service"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

        <Form.Item
          label="Service Icon"
          name="icon"
          valuePropName="fileList"
          getValueFromEvent={(event) => {
            if (Array.isArray(event)) return event;
            return event?.fileList || [];
          }}
          extra="Upload a new file only if you want to replace the current icon."
        >
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Upload Icon</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Icon Name" name="iconName">
          <Input placeholder="Fallback icon name, e.g. ambulance" />
        </Form.Item>

        <Form.Item label="Color Hex" name="colorHex">
          <Input placeholder="Enter color hex, e.g. #EF4444" />
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
            Update Service
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
