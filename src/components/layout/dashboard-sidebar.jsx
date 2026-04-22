"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  AlertOutlined,
  DeploymentUnitOutlined,
  TeamOutlined,
  CarOutlined,
  MedicineBoxOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

export default function DashboardSidebar({ collapsed }) {
  const pathname = usePathname();

  const items = useMemo(
    () => [
      {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: <Link href="/dashboard">Dashboard</Link>,
      },
      {
        key: "/dashboard/reports",
        icon: <AlertOutlined />,
        label: <Link href="/dashboard/reports">Emergency Reports</Link>,
      },
      {
        key: "/dashboard/dispatches",
        icon: <DeploymentUnitOutlined />,
        label: <Link href="/dashboard/dispatches">Dispatches</Link>,
      },
      {
        key: "master-data",
        icon: <TeamOutlined />,
        label: "Master Data",
        children: [
          {
            key: "/dashboard/services",
            icon: <AppstoreOutlined />,
            label: <Link href="/dashboard/services">Services</Link>,
          },
          {
            key: "/dashboard/officers",
            icon: <TeamOutlined />,
            label: <Link href="/dashboard/officers">Officers</Link>,
          },
          {
            key: "/dashboard/ambulances",
            icon: <CarOutlined />,
            label: <Link href="/dashboard/ambulances">Ambulances</Link>,
          },
          {
            key: "/dashboard/hospitals",
            icon: <MedicineBoxOutlined />,
            label: <Link href="/dashboard/hospitals">Hospitals</Link>,
          },
        ],
      },
    ],
    [],
  );

  const selectedKeys = useMemo(() => {
    if (pathname.startsWith("/dashboard/reports"))
      return ["/dashboard/reports"];
    if (pathname.startsWith("/dashboard/dispatches"))
      return ["/dashboard/dispatches"];
    if (pathname.startsWith("/dashboard/services"))
      return ["/dashboard/services"];
    if (pathname.startsWith("/dashboard/officers"))
      return ["/dashboard/officers"];
    if (pathname.startsWith("/dashboard/ambulances"))
      return ["/dashboard/ambulances"];
    if (pathname.startsWith("/dashboard/hospitals"))
      return ["/dashboard/hospitals"];
    return ["/dashboard"];
  }, [pathname]);

  const openKeys = useMemo(() => {
    if (
      pathname.startsWith("/dashboard/services") ||
      pathname.startsWith("/dashboard/officers") ||
      pathname.startsWith("/dashboard/ambulances") ||
      pathname.startsWith("/dashboard/hospitals")
    ) {
      return ["master-data"];
    }
    return [];
  }, [pathname]);

  return (
    <Sider
      collapsible
      trigger={null}
      collapsed={collapsed}
      width={260}
      collapsedWidth={80}
      className="border-r border-slate-200 !bg-white"
    >
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        {collapsed ? (
          <div className="mx-auto h-8 w-8 rounded-lg bg-blue-600" />
        ) : (
          <div>
            <p className="text-base font-bold text-slate-900">
              Emergency Admin
            </p>
            <p className="text-xs text-slate-500">Control Center</p>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        inlineCollapsed={collapsed}
        items={items}
        className="h-[calc(100vh-64px)] border-0 pt-2"
      />
    </Sider>
  );
}
