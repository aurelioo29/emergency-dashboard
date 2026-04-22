"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Select,
  Switch,
  Button,
  Tag,
  message,
  Empty,
  Spin,
  Tooltip,
} from "antd";
import { DeleteOutlined, StarOutlined } from "@ant-design/icons";
import { clientApiFetch } from "@/lib/client-api";

export default function ManageOfficerServicesModal({
  open,
  onClose,
  officer,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [primaryLoadingId, setPrimaryLoadingId] = useState(null);

  const [assignedServices, setAssignedServices] = useState([]);
  const [allServices, setAllServices] = useState([]);

  const fetchData = async () => {
    if (!officer?.id) return;

    try {
      setLoadingList(true);

      const [assignedResult, activeServicesResult] = await Promise.all([
        clientApiFetch(`/officer-services/officer/${officer.id}`),
        clientApiFetch("/services/active"),
      ]);

      setAssignedServices(assignedResult?.data || []);
      setAllServices(activeServicesResult?.data || []);
    } catch (error) {
      message.error(error.message || "Failed to load officer services");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (open && officer?.id) {
      form.resetFields();
      fetchData();
    } else {
      form.resetFields();
      setAssignedServices([]);
      setAllServices([]);
    }
  }, [open, officer?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableServiceOptions = useMemo(() => {
    const assignedServiceIds = new Set(
      assignedServices.map((item) => item?.service?.id || item?.serviceId),
    );

    return allServices
      .filter((item) => !assignedServiceIds.has(item.id))
      .map((item) => ({
        value: item.id,
        label: `${item.serviceName} (${item.serviceCode})`,
      }));
  }, [assignedServices, allServices]);

  const handleAssign = async (values) => {
    if (!officer?.id) {
      message.error("Officer id is missing");
      return;
    }

    try {
      setSubmitting(true);

      await clientApiFetch("/officer-services", {
        method: "POST",
        body: JSON.stringify({
          officerId: officer.id,
          serviceId: values.serviceId,
          isPrimary: values.isPrimary || false,
        }),
      });

      message.success("Service assigned successfully");
      form.resetFields();
      await fetchData();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to assign service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (mapping) => {
    try {
      setPrimaryLoadingId(mapping.id);

      await clientApiFetch(`/officer-services/${mapping.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isPrimary: true,
        }),
      });

      message.success("Primary service updated successfully");
      await fetchData();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to set primary service");
    } finally {
      setPrimaryLoadingId(null);
    }
  };

  const handleRemove = async (mapping) => {
    try {
      setRemovingId(mapping.id);

      await clientApiFetch(`/officer-services/${mapping.id}`, {
        method: "DELETE",
      });

      message.success("Service removed successfully");
      await fetchData();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to remove service");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal
      title="Manage Officer Services"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={760}
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-sm text-slate-500">Officer</p>
          <h3 className="m-0 text-lg font-semibold text-slate-900">
            {officer?.fullName || "-"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {officer?.email || "-"} • {officer?.role || "-"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h4 className="mb-3 text-base font-semibold text-slate-900">
            Assigned Services
          </h4>

          {loadingList ? (
            <div className="flex min-h-24 items-center justify-center">
              <Spin />
            </div>
          ) : assignedServices.length === 0 ? (
            <Empty description="No services assigned yet" />
          ) : (
            <div className="space-y-3">
              {assignedServices.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="m-0 font-medium text-slate-900">
                        {item?.service?.serviceName || "-"}
                      </p>
                      <Tag color="default">
                        {item?.service?.serviceCode || "-"}
                      </Tag>
                      {item?.isPrimary ? <Tag color="blue">Primary</Tag> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Mode: {item?.service?.autoAcceptMode || "-"} • Dispatch:{" "}
                      {item?.service?.requiresDispatch
                        ? "Required"
                        : "No Dispatch"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!item?.isPrimary ? (
                      <Tooltip title="Set Primary">
                        <Button
                          icon={<StarOutlined />}
                          loading={primaryLoadingId === item.id}
                          onClick={() => handleSetPrimary(item)}
                        >
                          Set Primary
                        </Button>
                      </Tooltip>
                    ) : null}

                    <Tooltip title="Remove Service">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={removingId === item.id}
                        onClick={() => handleRemove(item)}
                      >
                        Remove
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h4 className="mb-3 text-base font-semibold text-slate-900">
            Assign New Service
          </h4>

          <Form form={form} layout="vertical" onFinish={handleAssign}>
            <Form.Item
              label="Service"
              name="serviceId"
              rules={[{ required: true, message: "Service is required" }]}
            >
              <Select
                placeholder="Select service"
                options={availableServiceOptions}
                disabled={availableServiceOptions.length === 0}
              />
            </Form.Item>

            <Form.Item
              label="Set as Primary"
              name="isPrimary"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={onClose}>Close</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={availableServiceOptions.length === 0}
              >
                Assign Service
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
