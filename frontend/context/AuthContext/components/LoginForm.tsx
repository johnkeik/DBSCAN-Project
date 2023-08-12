import { Button, Form, FormInstance, Input } from "antd";
import React from "react";

const LoginForm = ({
  setPage,
  loginUser,
  message,
  setMessage,
  loading,
  setLoading,
}: {
  setPage: React.Dispatch<
    React.SetStateAction<"signup" | "forgot_password" | "login">
  >;
  loginUser: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<boolean>;
  message: { type: "error" | "success"; message: string } | null;
  setMessage: React.Dispatch<
    React.SetStateAction<{
      type: "success" | "error";
      message: string;
    } | null>
  >;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const formRef = React.useRef<FormInstance>(null);
  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setMessage(null);
    setLoading(true);

    await loginUser({
      email: values.username,
      password: values.password,
    }).then((response) => {
      setLoading(false);
      if (response) {
        formRef.current?.resetFields();
      }
    });
  };
  return (
    <Form
      onFinish={handleSubmit}
      ref={formRef}
      className="flex flex-col justify-center items-center"
    >
      <h1 className=" text-xl pb-5">Login</h1>

      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: "Please enter your email!",
          },
        ]}
      >
        <Input placeholder="Email" autoComplete="on" size="large" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: "Please input your password!",
          },
        ]}
      >
        <Input.Password
          placeholder="Password"
          type="password"
          autoComplete="on"
          size="large"
        />
      </Form.Item>
      <div className="flex justify-end w-full">
        <h1
          className=" flex-wrap inline-block text-blue-900  hover:text-blue-700 underline hover:cursor-pointer"
          onClick={() => setPage("forgot_password")}
        >
          Forgot Password?
        </h1>
      </div>

      <div className="flex flex-col w-full  justify-center pt-2">
        {message && (
          <h1
            className={`w-full ${
              message.type === "error" ? " text-red-800" : " text-green-600"
            }`}
          >
            {message.message}
          </h1>
        )}
        <Form.Item>
          <Button
            htmlType="submit"
            className=" w-full mb-3"
            loading={loading}
            style={{ backgroundColor: "blue", color: "white" }}
            size="large"
          >
            Log In
          </Button>
          <Button
            onClick={() => setPage("signup")}
            className="w-full"
            disabled={loading}
            size="large"
          >
            Sign Up
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};

export default LoginForm;
