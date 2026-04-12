import { Card } from "antd";

export default function StatCard({ title, value, subtitle }) {
  return (
    <Card className="border border-slate-200 shadow-none">
      <div className="space-y-1">
        <p className="m-0 text-sm font-medium text-slate-500">{title}</p>
        <h3 className="m-0 text-3xl font-bold text-slate-900">{value}</h3>
        {subtitle ? (
          <p className="m-0 text-xs text-slate-400">{subtitle}</p>
        ) : null}
      </div>
    </Card>
  );
}
