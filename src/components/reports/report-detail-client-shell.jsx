"use client";

import { useCallback, useMemo, useState } from "react";
import { Descriptions, Tag, Alert, message } from "antd";
import StatusBadge from "@/components/common/status-badge";
import ReportDetailHeader from "./report-detail-header";
import ReportDetailTables from "./reports-detail-tables";
import ReportLocationMap from "./report-location-map";
import ReportPhotoPreview from "./report-photo-preview";
import ReportDetailRealtime from "./report-detail-realtime";

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatText(value) {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
}

export default function ReportDetailClientShell({ report }) {
  const [liveOfficerLocation, setLiveOfficerLocation] = useState(null);
  const [liveReportStatus, setLiveReportStatus] = useState(
    report?.status || null,
  );
  const [liveDispatches, setLiveDispatches] = useState(
    report?.dispatches || [],
  );

  const hasDispatch =
    Array.isArray(liveDispatches) && liveDispatches.length > 0;

  const handleLocationUpdate = useCallback((data) => {
    setLiveOfficerLocation(data);
  }, []);

  const handleReportUpdate = useCallback((data) => {
    if (data?.status) {
      setLiveReportStatus(data.status);
      message.info(`Report updated: ${data.status}`);
    }
  }, []);

  const handleDispatchUpdate = useCallback((data) => {
    if (!data?.dispatchId) return;

    setLiveDispatches((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === data.dispatchId,
      );

      if (existingIndex === -1) {
        return [
          {
            id: data.dispatchId,
            dispatchStatus: data.dispatchStatus || "ASSIGNED",
            autoAssigned: data.autoAssigned ?? false,
            assignmentOrder: data.assignmentOrder || 1,
            expiresAt: data.expiresAt || null,
            assignedAt: data.updatedAt || new Date().toISOString(),
            report: {
              id: data.reportId,
              reportCode: data.reportCode,
              status: data.reportStatus,
              service: {
                id: data.serviceId,
                serviceCode: data.serviceCode,
                serviceName: data.serviceName,
              },
            },
            service: {
              id: data.serviceId,
              serviceCode: data.serviceCode,
              serviceName: data.serviceName,
            },
            officer: data.officerId
              ? {
                  id: data.officerId,
                  fullName: data.officerName || "-",
                }
              : null,
            ambulance: data.ambulanceId
              ? {
                  id: data.ambulanceId,
                }
              : null,
          },
          ...prev,
        ];
      }

      const next = [...prev];
      next[existingIndex] = {
        ...next[existingIndex],
        dispatchStatus:
          data.dispatchStatus ?? next[existingIndex].dispatchStatus,
        autoAssigned:
          data.autoAssigned !== undefined
            ? data.autoAssigned
            : next[existingIndex].autoAssigned,
        assignmentOrder:
          data.assignmentOrder ?? next[existingIndex].assignmentOrder,
        expiresAt: data.expiresAt ?? next[existingIndex].expiresAt,
        report: {
          ...next[existingIndex].report,
          status: data.reportStatus ?? next[existingIndex]?.report?.status,
        },
        service: data.serviceId
          ? {
              ...next[existingIndex].service,
              id: data.serviceId,
              serviceCode:
                data.serviceCode ?? next[existingIndex]?.service?.serviceCode,
              serviceName:
                data.serviceName ?? next[existingIndex]?.service?.serviceName,
            }
          : next[existingIndex].service,
        officer: data.officerId
          ? {
              ...next[existingIndex].officer,
              id: data.officerId,
              fullName:
                data.officerName ?? next[existingIndex]?.officer?.fullName,
            }
          : next[existingIndex].officer,
      };

      return next;
    });

    if (data?.reportStatus) {
      setLiveReportStatus(data.reportStatus);
    }

    if (data?.__event === "dispatch:failed") {
      message.error("Dispatch failed");
    } else {
      message.success("Dispatch updated");
    }
  }, []);

  const mergedReport = useMemo(
    () => ({
      ...report,
      status: liveReportStatus || report?.status,
      dispatches: liveDispatches,
    }),
    [report, liveReportStatus, liveDispatches],
  );

  return (
    <div className="space-y-6">
      <ReportDetailRealtime
        reportId={report.id}
        onLocationUpdate={handleLocationUpdate}
        onReportUpdate={handleReportUpdate}
        onDispatchUpdate={handleDispatchUpdate}
      />

      <ReportDetailHeader report={mergedReport} />

      {!hasDispatch && report?.service?.requiresDispatch === true ? (
        <Alert
          type="warning"
          showIcon
          message="No dispatch assigned yet"
          description="This report still has no dispatch assignment."
        />
      ) : null}

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="m-0 text-base font-semibold text-slate-800">
            Report Information
          </h2>
        </div>

        <div className="p-4">
          <Descriptions column={2} bordered size="middle">
            <Descriptions.Item label="Report Code">
              {mergedReport.reportCode || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <StatusBadge status={mergedReport.status} />
            </Descriptions.Item>

            <Descriptions.Item label="Service">
              <div className="space-y-1">
                <div>
                  {mergedReport?.service?.serviceName ||
                    formatText(mergedReport?.emergencyType)}
                </div>
                {mergedReport?.service?.serviceCode ? (
                  <Tag color="default">{mergedReport.service.serviceCode}</Tag>
                ) : null}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Requested At">
              {formatDate(mergedReport.requestedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Dispatch Mode">
              {mergedReport?.service?.requiresDispatch ? (
                <Tag color="processing">
                  {formatText(
                    mergedReport?.service?.autoAcceptMode || "MANUAL",
                  )}
                </Tag>
              ) : (
                <Tag color="default">No Dispatch</Tag>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Nearest Hospital">
              {mergedReport?.nearestHospital?.hospitalName || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Description" span={2}>
              {mergedReport.description || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Address Snapshot" span={2}>
              {mergedReport.addressSnapshot || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Latitude">
              {mergedReport.latitude ?? "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Longitude">
              {mergedReport.longitude ?? "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Assigned At">
              {formatDate(mergedReport.assignedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Accepted At">
              {formatDate(mergedReport.acceptedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Arrived At">
              {formatDate(mergedReport.arrivedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Completed At">
              {formatDate(mergedReport.completedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Cancelled At">
              {formatDate(mergedReport.cancelledAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Failed At">
              {formatDate(mergedReport.failedAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="m-0 text-base font-semibold text-slate-800">
              Report Location Map
            </h2>
          </div>

          <div className="p-4">
            <ReportLocationMap
              latitude={mergedReport.latitude}
              longitude={mergedReport.longitude}
              addressSnapshot={mergedReport.addressSnapshot}
              officerLocation={liveOfficerLocation}
            />
          </div>
        </div>

        <div className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="m-0 text-base font-semibold text-slate-800">
              Report Photo
            </h2>
          </div>

          <div className="p-4">
            <ReportPhotoPreview
              photoUrl={mergedReport.photoUrl}
              reportCode={mergedReport.reportCode}
            />
          </div>
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="m-0 text-base font-semibold text-slate-800">
            Requester Information
          </h2>
        </div>

        <div className="p-4">
          <Descriptions column={2} bordered size="middle">
            <Descriptions.Item label="Full Name">
              {mergedReport?.user?.fullName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number">
              {mergedReport?.user?.phoneNumber || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="NIK">
              {mergedReport?.user?.nik || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Address">
              {mergedReport?.user?.address || "-"}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <ReportDetailTables
        trackingLogs={mergedReport.trackingLogs || []}
        dispatches={mergedReport.dispatches || []}
      />
    </div>
  );
}
