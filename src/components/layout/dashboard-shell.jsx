"use client";

import { useState } from "react";
import { Layout } from "antd";
import DashboardSidebar from "./dashboard-sidebar";
import DashboardTopbar from "./dashboard-topbar";
import DashboardPageHeader from "./dashboard-page-header";
import DashboardRealtimeListener from "./dashboard-realtime-listener";

const { Content } = Layout;

export default function DashboardShell({ user, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen bg-slate-100">
      <DashboardRealtimeListener />

      <DashboardSidebar collapsed={collapsed} />

      <Layout>
        <DashboardTopbar
          user={user}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <DashboardPageHeader />

        <div className="p-4 md:p-6">
          <Content className="border border-slate-200 bg-white p-4 md:p-6">
            {children}
          </Content>
        </div>
      </Layout>
    </Layout>
  );
}
