"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, message } from "antd";
import { clientApiFetch } from "@/lib/client-api";
import LocationPicker from "@/components/maps/location-picker";

export default function EditHospitalModal({
  open,
  onClose,
  hospital,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (hospital) {
      form.setFieldsValue({
        hospitalName: hospital.hospitalName || "",
        address: hospital.address || "",
        phoneNumber: hospital.phoneNumber || "",
        latitude: hospital.latitude ?? -6.2,
        longitude: hospital.longitude ?? 106.816666,
      });
    } else {
      form.resetFields();
    }
  }, [open, hospital, form]);

  const handleSubmit = async (values) => {
    if (!hospital?.id) {
      message.error("Hospital id is missing");
      return;
    }

    try {
      setLoading(true);

      await clientApiFetch(`/hospitals/${hospital.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          hospitalName: values.hospitalName,
          address: values.address,
          phoneNumber: values.phoneNumber,
          latitude: values.latitude ?? null,
          longitude: values.longitude ?? null,
        }),
      });

      message.success("Hospital updated successfully");
      onClose?.();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || "Failed to update hospital");
    } finally {
      setLoading(false);
    }
  };

  const latitude = Form.useWatch("latitude", form);
  const longitude = Form.useWatch("longitude", form);

  return (
    <Modal
      title="Edit Hospital"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={720}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Hospital Name"
          name="hospitalName"
          rules={[{ required: true, message: "Hospital name is required" }]}
        >
          <Input placeholder="Enter hospital name" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Address is required" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter address" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[{ required: true, message: "Phone number is required" }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Pick Location
          </label>

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={({ latitude: lat, longitude: lng }) => {
              form.setFieldsValue({
                latitude: lat,
                longitude: lng,
              });
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item label="Latitude" name="latitude">
            <InputNumber className="!w-full" placeholder="Latitude" />
          </Form.Item>

          <Form.Item label="Longitude" name="longitude">
            <InputNumber className="!w-full" placeholder="Longitude" />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Hospital
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
