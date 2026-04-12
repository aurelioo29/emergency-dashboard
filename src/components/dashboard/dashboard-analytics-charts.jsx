"use client";

import { Row, Col } from "antd";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
];

function ChartCard({ title, children }) {
  return (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="m-0 text-base font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
      No data available
    </div>
  );
}

export default function DashboardAnalyticsCharts({ charts }) {
  const {
    reportStatusData = [],
    dispatchStatusData = [],
    emergencyTypeData = [],
    officerStatusData = [],
    ambulanceStatusData = [],
  } = charts || {};

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <ChartCard title="Reports by Status">
          {reportStatusData.length === 0 ? (
            <EmptyChartState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reportStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </Col>

      <Col xs={24} xl={12}>
        <ChartCard title="Dispatches by Status">
          {dispatchStatusData.length === 0 ? (
            <EmptyChartState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dispatchStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </Col>

      <Col xs={24} xl={8}>
        <ChartCard title="Emergency Type Distribution">
          {emergencyTypeData.length === 0 ? (
            <EmptyChartState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={emergencyTypeData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {emergencyTypeData.map((entry, index) => (
                    <Cell
                      key={`emergency-type-${entry.name}-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </Col>

      <Col xs={24} xl={8}>
        <ChartCard title="Officer Status Breakdown">
          {officerStatusData.length === 0 ? (
            <EmptyChartState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={officerStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {officerStatusData.map((entry, index) => (
                    <Cell
                      key={`officer-status-${entry.name}-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </Col>

      <Col xs={24} xl={8}>
        <ChartCard title="Ambulance Status Breakdown">
          {ambulanceStatusData.length === 0 ? (
            <EmptyChartState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={ambulanceStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {ambulanceStatusData.map((entry, index) => (
                    <Cell
                      key={`ambulance-status-${entry.name}-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </Col>
    </Row>
  );
}
