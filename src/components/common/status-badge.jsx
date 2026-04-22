"use client";

import { Tag } from "antd";

const statusColorMap = {
  // emergency reports
  REPORTED: "default",
  ASSIGNED: "processing",
  ACCEPTED: "processing",
  ON_THE_WAY: "blue",
  ARRIVED: "cyan",
  HANDLING: "gold",
  COMPLETED: "success",
  CANCELLED: "error",
  FAILED: "error",

  // dispatches
  REJECTED: "warning",
  EXPIRED: "volcano",

  // officers
  AVAILABLE: "success",
  ON_DUTY: "processing",
  OFFLINE: "default",

  // ambulances
  DISPATCHED: "processing",
  MAINTENANCE: "warning",
  INACTIVE: "default",

  // services / modes
  FULL_AUTO: "success",
  CONFIRM: "warning",
  MANUAL: "default",
};

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StatusBadge({ status }) {
  return (
    <Tag color={statusColorMap[status] || "default"}>{formatLabel(status)}</Tag>
  );
}
