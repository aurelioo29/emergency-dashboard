import { Alert, Row, Col } from "antd";
import { apiFetch } from "@/lib/api";
import StatCard from "@/components/common/stat-card";
import StatusBadge from "@/components/common/status-badge";
import DashboardAnalyticsCharts from "@/components/dashboard/dashboard-analytics-charts";

function formatText(value) {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
}

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

function groupCount(items, key) {
  const result = {};

  for (const item of items) {
    const value = item?.[key] || "UNKNOWN";
    result[value] = (result[value] || 0) + 1;
  }

  return Object.entries(result).map(([name, value]) => ({
    name: formatText(name),
    value,
  }));
}

async function getDashboardAnalytics() {
  const [reportsRes, dispatchesRes, officersRes, ambulancesRes] =
    await Promise.all([
      apiFetch("/emergency-reports?page=1&limit=100"),
      apiFetch("/dispatches?page=1&limit=100"),
      apiFetch("/officers?page=1&limit=100"),
      apiFetch("/ambulances?page=1&limit=100"),
    ]);

  const reports = reportsRes.data || [];
  const dispatches = dispatchesRes.data || [];
  const officers = officersRes.data || [];
  const ambulances = ambulancesRes.data || [];

  const activeReportStatuses = [
    "REPORTED",
    "ASSIGNED",
    "ON_THE_WAY",
    "ARRIVED",
    "HANDLING",
  ];

  const activeDispatchStatuses = [
    "ASSIGNED",
    "ACCEPTED",
    "ON_THE_WAY",
    "ARRIVED",
  ];

  const totalReports = reports.length;
  const activeReports = reports.filter((item) =>
    activeReportStatuses.includes(item.status),
  ).length;
  const completedReports = reports.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const cancelledReports = reports.filter(
    (item) => item.status === "CANCELLED",
  ).length;

  const activeDispatches = dispatches.filter((item) =>
    activeDispatchStatuses.includes(item.dispatchStatus),
  ).length;

  const availableOfficers = officers.filter(
    (item) => item.isActive && item.status === "AVAILABLE",
  ).length;

  const availableAmbulances = ambulances.filter(
    (item) => item.status === "AVAILABLE",
  ).length;

  const reportStatusData = groupCount(reports, "status");
  const dispatchStatusData = groupCount(dispatches, "dispatchStatus");
  const emergencyTypeData = groupCount(reports, "emergencyType");
  const officerStatusData = groupCount(officers, "status");
  const ambulanceStatusData = groupCount(ambulances, "status");

  const latestReports = [...reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const latestDispatches = [...dispatches]
    .sort(
      (a, b) =>
        new Date(b.assignedAt || b.createdAt) -
        new Date(a.assignedAt || a.createdAt),
    )
    .slice(0, 5);

  return {
    totals: {
      totalReports,
      activeReports,
      completedReports,
      cancelledReports,
      activeDispatches,
      availableOfficers,
      availableAmbulances,
    },
    charts: {
      reportStatusData,
      dispatchStatusData,
      emergencyTypeData,
      officerStatusData,
      ambulanceStatusData,
    },
    latestReports,
    latestDispatches,
  };
}

export default async function DashboardPage() {
  let analytics = null;
  let pageError = null;

  try {
    analytics = await getDashboardAnalytics();
  } catch (error) {
    pageError = error.message || "Failed to load analytics dashboard";
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Analytics Dashboard
        </h1>
        <Alert
          type="error"
          showIcon
          title="Failed to load analytics dashboard"
          description={pageError}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">
          Analytics Dashboard
        </h1>
        <p className="m-0 text-sm text-slate-500">
          Emergency operations summary for reports, dispatches, officers, and
          ambulances.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Total Reports"
            value={analytics.totals.totalReports}
            subtitle="All emergency reports"
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Active Reports"
            value={analytics.totals.activeReports}
            subtitle="Still in progress"
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Completed Reports"
            value={analytics.totals.completedReports}
            subtitle="Resolved emergencies"
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Cancelled Reports"
            value={analytics.totals.cancelledReports}
            subtitle="Closed without completion"
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Active Dispatches"
            value={analytics.totals.activeDispatches}
            subtitle="Units currently deployed"
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Available Officers"
            value={analytics.totals.availableOfficers}
            subtitle="Ready for assignment"
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Available Ambulances"
            value={analytics.totals.availableAmbulances}
            subtitle="Ready for dispatch"
          />
        </Col>
      </Row>

      <DashboardAnalyticsCharts charts={analytics.charts} />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <div className="border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="m-0 text-base font-semibold text-slate-800">
                Latest Reports
              </h2>
            </div>

            <div className="divide-y divide-slate-200">
              {analytics.latestReports.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">
                  No reports found.
                </div>
              ) : (
                analytics.latestReports.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="m-0 font-medium text-slate-900">
                        {item.reportCode}
                      </p>
                      <p className="m-0 text-sm text-slate-500">
                        {formatText(item.emergencyType)} •{" "}
                        {item?.user?.fullName || "-"}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <StatusBadge status={item.status} />
                      <p className="m-0 text-xs text-slate-400">
                        {formatDate(item.requestedAt || item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} xl={12}>
          <div className="border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="m-0 text-base font-semibold text-slate-800">
                Latest Dispatches
              </h2>
            </div>

            <div className="divide-y divide-slate-200">
              {analytics.latestDispatches.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">
                  No dispatches found.
                </div>
              ) : (
                analytics.latestDispatches.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="m-0 font-medium text-slate-900">
                        {item?.report?.reportCode || "-"}
                      </p>
                      <p className="m-0 text-sm text-slate-500">
                        {item?.officer?.fullName || "-"} •{" "}
                        {item?.ambulance?.code || "-"}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <StatusBadge status={item.dispatchStatus} />
                      <p className="m-0 text-xs text-slate-400">
                        {formatDate(item.assignedAt || item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
