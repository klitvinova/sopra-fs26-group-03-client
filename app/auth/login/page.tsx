"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input, Card } from "antd";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  label: string;
  value: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const handleLogin = async (values: FormFieldProps) => {
    try {
      await apiService.post<User>("/auth/login", values);

      // Navigate to the user overview
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4 py-6">
      <Card className="w-full max-w-md rounded-[2rem] border border-primary-500/20 bg-white/90 shadow-xl backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-primary-600">
            Welcome back!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Log in to continue to PlateMate.
          </p>
        </div>
        <Form
          form={form}
          name="login"
          size="large"
          variant="outlined"
          className="register-form"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            className="mb-4"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            className="mb-3"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <a className="forgot-password">Forgot password?</a>
          <Form.Item className="mb-3">
            <Button
              htmlType="submit"
              className="login-button !h-11 !font-semibold"
            >
              Log in
            </Button>
          </Form.Item>
          <Form.Item className="mb-0">
            <Button
              htmlType="button"
              className="register-button !h-11 !font-semibold"
              onClick={() => router.push("/auth/register")}
            >
              Create account
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
