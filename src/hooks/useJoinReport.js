"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export default function useJoinReport(reportId) {
  useEffect(() => {
    if (!reportId) return;

    const socket = getSocket();

    socket.emit("join:report", reportId);

    return () => {
      socket.emit("leave:report", reportId);
    };
  }, [reportId]);
}
