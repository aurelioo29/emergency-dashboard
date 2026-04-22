"use client";

import { Breadcrumb } from "antd";
import { usePathname } from "next/navigation";

const pageMap = {
  "/dashboard": {
    title: "Dashboard",
    items: [{ title: "Home" }, { title: "Dashboard" }],
  },
  "/dashboard/reports": {
    title: "Emergency Reports",
    items: [{ title: "Home" }, { title: "Emergency Reports" }],
  },
  "/dashboard/dispatches": {
    title: "Dispatches",
    items: [{ title: "Home" }, { title: "Dispatches" }],
  },
  "/dashboard/officers": {
    title: "Officers",
    items: [{ title: "Home" }, { title: "Master Data" }, { title: "Officers" }],
  },
  "/dashboard/services": {
    title: "Services",
    items: [{ title: "Home" }, { title: "Master Data" }, { title: "Services" }],
  },
  "/dashboard/ambulances": {
    title: "Ambulances",
    items: [
      { title: "Home" },
      { title: "Master Data" },
      { title: "Ambulances" },
    ],
  },
  "/dashboard/hospitals": {
    title: "Hospitals",
    items: [
      { title: "Home" },
      { title: "Master Data" },
      { title: "Hospitals" },
    ],
  },
};

export default function DashboardPageHeader() {
  const pathname = usePathname();

  const config = pageMap[pathname] || {
    title: "Dashboard",
    items: [{ title: "Home" }, { title: "Dashboard" }],
  };

  return (
    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <h2 className="m-0 text-xl font-semibold text-slate-800">
          {config.title}
        </h2>

        <span className="text-slate-300">/</span>

        <Breadcrumb items={config.items} className="text-sm" />
      </div>
    </div>
  );
}
