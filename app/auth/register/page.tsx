"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Card, Form, Input } from "antd";
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
				alert(`Something went wrong during the registration:\n${error.message}`);
			} else {
				console.error("An unknown error occurred during registration.");
			}
		}
	};

	return (
		<div className="register-container">
			<Card className="dashboard-container">
				<p style={{ fontSize: "24px", textAlign: "center", marginBottom: "24px" }}>Welcome!</p>
				<Form
					form={form}
					name="register"
					size="large"
					variant="outlined"
					className="register-form"
					onFinish={handleRegister}
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
						name="email"
						// label="E-mail"
						rules={[{ required: true, message: "Please input your e-mail!" }]}
					>
						<Input placeholder="E-mail" />
					</Form.Item>
					<Form.Item
						name="password"
						validateTrigger="onChange"
						// label="Password"
						rules={[
							{ required: true, message: "Please input your password!" },
							{ min: 8, message: "Password must be at least 8 characters!" },
							{ pattern: /[a-z]/, message: "At least one lowercase letter!" },
							{ pattern: /[A-Z]/, message: "At least one uppercase letter!" },
							{ pattern: /\d/, message: "At least one number!" },
							{ pattern: /[@$!%*?&.]/, message: "At least one special character!" },
						]}
					>
						<Input.Password placeholder="Password" />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" className="register-button">
							Sign Up
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default Register;
