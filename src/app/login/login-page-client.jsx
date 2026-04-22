"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Typography, Alert } from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Email or password is incorrect");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Section */}
        <section className="hidden lg:flex flex-col justify-between bg-[#0f172a] px-12 py-10 text-white">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <Image
                  src="/icon.png"
                  alt="Alerta Logo"
                  width={30}
                  height={30}
                  className="h-auto w-auto"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-wide">Alerta</h1>
                <p className="text-sm text-slate-300">Emergency Dashboard</p>
              </div>
            </div>

            <div className="max-w-md">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                <SafetyCertificateOutlined />
                Secure access for administrators
              </p>

              <Title
                level={1}
                className="!mb-4 !text-white !text-5xl !leading-tight"
              >
                Manage emergency reports with speed and clarity.
              </Title>

              <Text className="!text-base !text-slate-300">
                Access the Alerta admin panel to monitor incidents, manage
                reports, and coordinate response workflows in one place.
              </Text>
            </div>
          </div>

          <div className="pt-10 text-sm text-slate-400">
            Built for faster response, fewer headaches, and less dashboard
            suffering.
          </div>
        </section>

        {/* Right Section */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile Branding */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-md">
                <Image
                  src="/icon.png"
                  alt="Alerta Logo"
                  width={34}
                  height={34}
                  className="h-auto w-auto"
                />
              </div>
              <Title level={3} className="!mb-1">
                Alerta Dashboard
              </Title>
              <Text type="secondary">
                Sign in to continue to the admin panel
              </Text>
            </div>

            <Card className="rounded-[24px] border-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="mb-8">
                <Title level={2} className="!mb-1 !text-slate-900">
                  Welcome back
                </Title>
                <Text className="!text-slate-500">
                  Please enter your account details
                </Text>
              </div>

              {errorMessage ? (
                <Alert
                  type="error"
                  message={errorMessage}
                  className="mb-5"
                  showIcon
                />
              ) : null}

              <Form layout="vertical" onFinish={onFinish} size="large">
                <Form.Item
                  label={
                    <span className="font-medium text-slate-700">Email</span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Email is required" },
                    { type: "email", message: "Email format is invalid" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-slate-400" />}
                    placeholder="Enter your email"
                    className="h-12 rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-slate-700">Password</span>
                  }
                  name="password"
                  rules={[{ required: true, message: "Password is required" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-slate-400" />}
                    placeholder="Enter your password"
                    className="h-12 rounded-xl"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="!mt-2 !h-12 !rounded-xl !font-semibold"
                >
                  Sign In
                </Button>
              </Form>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
