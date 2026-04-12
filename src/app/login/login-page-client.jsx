"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Typography, Alert } from "antd";

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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-sm">
        <div className="mb-6 text-center">
          <Title level={2} className="!mb-1">
            Admin Login
          </Title>
          <Text type="secondary">Sign in to Alerta - Emergency Dashboard</Text>
        </div>

        {errorMessage ? (
          <Alert
            type="error"
            message={errorMessage}
            className="mb-4"
            showIcon
          />
        ) : null}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Email format is invalid" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form>
      </Card>
    </main>
  );
}
