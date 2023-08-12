import { Button, Input, Form } from "antd";
import { useState } from "react";

const PASS_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const EMAIL_REGEX = /^[a-z0-9+_.-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

const SignupForm = ({
  setPage,
  register,
  message,
}: {
  setPage: React.Dispatch<
    React.SetStateAction<"signup" | "forgot_password" | "login">
  >;
  register: ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => void;
  message: { type: "error" | "success"; message: string } | null;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    confirm: string;
  }) => {
    setLoading(true);
    await register({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    setLoading(false);
  };
  return (
    <Form
      onFinish={handleSubmit}
      className="flex flex-col justify-center items-center"
    >
      <h1 className=" text-xl pb-5">Register</h1>
      <Form.Item
        name="name"
        rules={[
          {
            required: true,
            message: "Please enter your name!",
          },
        ]}
      >
        <Input size="large" placeholder="Enter your name" />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: "Please enter your email!",
          },
          {
            pattern: EMAIL_REGEX,
            message: "Please enter a valid email!",
          },
        ]}
      >
        <Input size="large" placeholder="Email" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: "Please enter your password!",
          },
          {
            pattern: PASS_REGEX,
            message:
              "Password must be Minimum eight characters, at least one letter and one number",
          },
        ]}
      >
        <Input.Password size="large" placeholder="Password" />
      </Form.Item>
      <Form.Item
        name="confirm"
        dependencies={["password"]}
        rules={[
          {
            required: true,
            message: "Please confirm your password!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords must match!"));
            },
          }),
        ]}
      >
        <Input.Password size="large" placeholder="Password confirmation" />
      </Form.Item>
      <div className="flex flex-col gap-3 justify-center w-full pt-2">
        {message && (
          <h1
            className={`w-full ${
              message.type === "error" ? " text-red-800" : " text-green-600"
            }`}
          >
            {message.message}
          </h1>
        )}
        <Button
          className=""
          htmlType="submit"
          style={{ backgroundColor: "blue", color: "white" }}
          size="large"
        >
          Register
        </Button>
        <Button onClick={() => setPage("login")} size="large">
          Log In
        </Button>
      </div>
    </Form>
  );
};

export default SignupForm;
