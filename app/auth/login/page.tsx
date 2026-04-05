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
			await apiService.post<User>("/login", values);

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
		<div className="login-container">
			<Card className="dashboard-container">
				<p style={{ fontSize: "24px", textAlign: "center", marginBottom: "24px" }}>Welcome back!</p>
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
						name="username"
						// label="Username"
						rules={[{ required: true, message: "Please input your username!" }]}
					>
						<Input placeholder="Username" />
					</Form.Item>
					<Form.Item
						name="password"
						// label="Name"
						rules={[{ required: true, message: "Please input your password!" }]}
					>
						<Input.Password placeholder="Password" />
					</Form.Item>
					<a className="forgot-password">Forgot password?</a>
					<Form.Item>
						<Button type="primary" htmlType="submit" className="login-button">
							Log in
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default Login;
