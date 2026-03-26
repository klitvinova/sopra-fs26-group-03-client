"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
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
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    // value: token, // is commented out because we do not need the token value
    set: setToken, // we need this method to set the value of the token to the one we receive from the POST request to the backend server API
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");

  const handleRegister = async (values: FormFieldProps) => {
    console.log(values)
    try {
      // Call the API service and let it handle JSON serialization and error handling
      
      const response = await apiService.post<User>("/users", values);
      console.log(response)
      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }

      // Navigate to the user overview
      router.push(`/users/${response.id}`);
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
        <p style={{ fontSize:"24px", textAlign:"center", marginBottom:"24px" }}>Welcome!</p>
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
