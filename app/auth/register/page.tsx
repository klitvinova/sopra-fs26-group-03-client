"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Card, Form, Input, Typography } from "antd";
import Image from "next/image";

const { Text } = Typography;
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  label: string;
  value: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const handleRegister = async (values: FormFieldProps) => {
    console.log(values);
    try {
      // Call the API service and let it handle JSON serialization and error handling

      const response = await apiService.post<User>("/auth/register", values);
      console.log(response);
      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available

      // Navigate to the user overview
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        alert(
          `Something went wrong during the registration:\n${error.message}`,
        );
      } else {
        console.error("An unknown error occurred during registration.");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      {/* Mini Logo for Auth */}
      <div className="flex items-center gap-3 mb-12 animate-fade-in-up">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-100">
          <Image alt="PlateMate logo" height={22} src="/favicon.svg" width={22} className="brightness-0 invert" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-800">
          PlateMate<span className="text-orange-500">.</span>
        </div>
      </div>

      <Card className="w-full max-w-md rounded-[2.5rem] border-none bg-orange-50/30 shadow-2xl shadow-slate-200/50 p-4 animate-fade-in-up delay-100">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Create account
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Sign up to start using PlateMate
          </p>
        </div>
        <Form
          form={form}
          name="register"
          size="large"
          variant="outlined"
          className="auth-form"
          onFinish={handleRegister}
          layout="vertical"
        >
          <Form.Item
            className="mb-4"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Username" className="!rounded-2xl !h-12 !border-slate-100" />
          </Form.Item>
          <Form.Item
            className="mb-4"
            name="email"
            rules={[
              { required: true, message: "Please input your e-mail!" },
              {
                pattern: /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*./,
                message: "Invalid email format!",
              },
            ]}
          >
            <Input placeholder="E-mail" className="!rounded-2xl !h-12 !border-slate-100" />
          </Form.Item>
          <Form.Item
            className="mb-8"
            name="password"
            validateTrigger="onChange"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 8, message: "Password must be at least 8 characters!" },
              { pattern: /[a-z]/, message: "At least one lowercase letter!" },
              { pattern: /[A-Z]/, message: "At least one uppercase letter!" },
              { pattern: /\d/, message: "At least one number!" },
              {
                pattern: /[@$!%*?&.]/,
                message: "At least one special character!",
              },
            ]}
          >
            <Input.Password placeholder="Password" className="!rounded-2xl !h-12 !border-slate-100" />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              htmlType="submit"
              type="primary"
              className="pm-button-primary w-full !h-14 !rounded-2xl !text-lg !font-bold"
            >
              Sign Up
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="text-slate-400">Already have an account?</Text>
            <Button
              type="link"
              className="!text-orange-500 !font-bold hover:!text-orange-600"
              onClick={() => router.push("/auth/login")}
            >
              Log in instead
            </Button>
          </div>
        </Form>
      </Card>

      <div className="mt-12">
        <Button
          type="text"
          className="text-slate-400 hover:text-slate-600 font-medium"
          onClick={() => router.push("/")}
        >
          ← Back to home
        </Button>
      </div>
    </div>
  );
};

export default Register;
