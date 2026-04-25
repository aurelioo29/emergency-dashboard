"use client";

import { useEffect } from "react";
import { initSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";

export default function useSocket({ onReport, onDispatch, onLocation }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.accessToken) return;

    const socket = initSocket(session.accessToken);

    const handleReportCreated = (data) => {
      console.log("NEW REPORT:", data);
      onReport?.({
        ...data,
        __event: "report:created",
      });
    };

    const handleReportUpdated = (data) => {
      console.log("REPORT UPDATED:", data);
      onReport?.({
        ...data,
        __event: "report:updated",
      });
    };

    const handleDispatchUpdated = (data) => {
      console.log("DISPATCH:", data);
      onDispatch?.(data);
    };

    const handleDispatchFailed = (data) => {
      console.log("DISPATCH FAILED:", data);
      onDispatch?.({
        ...data,
        __event: "dispatch:failed",
      });
    };

    const handleOfficerLocationUpdated = (data) => {
      console.log("LOCATION:", data);
      onLocation?.(data);
    };

    socket.on("report:created", handleReportCreated);
    socket.on("report:updated", handleReportUpdated);
    socket.on("dispatch:updated", handleDispatchUpdated);
    socket.on("dispatch:failed", handleDispatchFailed);
    socket.on("officer:location_updated", handleOfficerLocationUpdated);

    return () => {
      socket.off("report:created", handleReportCreated);
      socket.off("report:updated", handleReportUpdated);
      socket.off("dispatch:updated", handleDispatchUpdated);
      socket.off("dispatch:failed", handleDispatchFailed);
      socket.off("officer:location_updated", handleOfficerLocationUpdated);
    };
  }, [session?.accessToken, onReport, onDispatch, onLocation]);
}
