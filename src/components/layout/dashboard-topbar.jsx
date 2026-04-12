"use client";

import { Avatar, Button, Dropdown, Layout, Space } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { signOut } from "next-auth/react";

const { Header } = Layout;

export default function DashboardTopbar({ user, collapsed, setCollapsed }) {
  const items = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: async () => {
        await signOut({ callbackUrl: "/login" });
      },
    },
  ];

  return (
    <Header className="!flex !h-14 !items-center !justify-between !border-b !border-slate-200 !bg-white !px-4 md:!px-6">
      <div className="flex items-center gap-3">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      <Dropdown menu={{ items }} placement="bottomRight">
        <Button type="text" className="!h-auto">
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="text-sm font-medium text-slate-700">
              {user?.name || "Admin"}
            </span>
          </Space>
        </Button>
      </Dropdown>
    </Header>
  );
}
