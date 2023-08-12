import { forgotPassword } from "@/api/auth";
import { Button, Input, Form } from "antd";
import { useState } from "react";

const EMAIL_REGEX = /^[a-z0-9+_.-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

const ForgotPasswordForm = ({
  setPage,
}: {
  setPage: React.Dispatch<
    React.SetStateAction<"signup" | "forgot_password" | "login">
  >;
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    await forgotPassword({ email: values.email })
      .then((response) => {
        if (response && response.status === 200) {
          setMessage({
            type: "success",
            message: response.message,
          });
        } else {
          setMessage({
            type: "error",
            message: response.message,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          type: "error",
          message: error,
        });
      });
    setLoading(false);
  };

  return (
    <Form
      onFinish={handleSubmit}
      className="flex flex-col justify-center items-center"
    >
      <h1 className="text-xl pb-5">Forgot you password?</h1>
      <h1 className="pb-3 text-center">
        In case you forgot your password please enter your email.
      </h1>
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
      <div className="w-full flex flex-col gap-3 justify-center pt-2">
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
          className="flex w-full items-center justify-center"
          htmlType="submit"
          style={{ backgroundColor: "blue", color: "white" }}
          size="large"
          loading={loading}
        >
          Send email
        </Button>
        <Button
          onClick={() => setPage("login")}
          size="large"
          className="flex w-full items-center justify-center"
          disabled={loading}
        >
          Log In
        </Button>
      </div>
    </Form>
  );
};

export default ForgotPasswordForm;
