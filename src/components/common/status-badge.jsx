"use client";

import { Tag } from "antd";

const statusColorMap = {
  REPORTED: "default",
  ASSIGNED: "processing",
  ON_THE_WAY: "blue",
  ARRIVED: "cyan",
  HANDLING: "gold",
  COMPLETED: "success",
  CANCELLED: "error",

  AVAILABLE: "success",
  ON_DUTY: "processing",
  OFFLINE: "default",

  DISPATCHED: "processing",
  MAINTENANCE: "warning",

  ACCEPTED: "processing",
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
