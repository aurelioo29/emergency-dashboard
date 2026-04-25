"use client";

import { message } from "antd";
import useSocket from "@/hooks/useSocket";

export default function DashboardRealtimeListener() {
  useSocket({
    onReport: (data) => {
      if (data?.__event === "report:created") {
        message.error("🚨 New Emergency Report");
      }

      if (data?.__event === "report:updated") {
        message.info("Report updated");
      }
    },

    onDispatch: (data) => {
      if (data?.__event === "dispatch:failed") {
        message.error("❗ Dispatch failed");
        return;
      }

      message.success("🚑 Dispatch updated");
    },
  });

  return null;
}
