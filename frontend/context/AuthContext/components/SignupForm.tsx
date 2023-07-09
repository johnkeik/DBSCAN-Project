import { Button, Input, Form } from "antd";

const PASS_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const EMAIL_REGEX = /^[a-z0-9+_.-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

const SignupForm = ({
  setPage,
  register,
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
}) => {
  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    confirm: string;
  }) => {
    await register({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  };
  return (
    <>
      <h1 className=" text-lg text-center">Register</h1>

      <Form onFinish={handleSubmit}>
        <Form.Item
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter your name!",
            },
          ]}
        >
          <Input placeholder="Enter your name" />
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
          <Input placeholder="Email" />
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
          <Input.Password placeholder="Password" />
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
          <Input.Password placeholder="Password confirmation" />
        </Form.Item>

        <div className="flex flex-col gap-3 justify-center pt-5">
          <Button
            className=""
            htmlType="submit"
            style={{ backgroundColor: "blue", color: "white" }}
          >
            Register
          </Button>
          <Button onClick={() => setPage("login")}>Log In</Button>
        </div>
      </Form>
    </>
  );
};

export default SignupForm;
