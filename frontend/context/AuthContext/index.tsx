import React, { createContext, useContext, useEffect, useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import { fetchUserInfo, loginUser, registerUser } from "@/api/user";
import Cookies from "js-cookie";
import { User } from "@/types";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";

interface AuthContextType {
  access_token: string | null;
  setAccessToken: (value: string | null) => void;
  openSigningModal: () => void;
  login: ({ email, password }: { email: string; password: string }) => void;
  logout: () => void;
  user: User | null;
}

export const AuthContext = createContext<AuthContextType>({
  access_token: null,
  setAccessToken: () => undefined,
  openSigningModal: () => undefined,
  login: () => undefined,
  logout: () => undefined,
  user: null,
});

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

function AuthProvider({ children }: { children: any }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [access_token, setAccessToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState<"login" | "signup" | "forgot_password">(
    "login"
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const openSigningModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setPage("login");
    setMessage(null);
    setLoading(false);
  }, [isOpen]);

  useEffect(() => {
    setMessage(null);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    let mounted = true;
    if (mounted)
      (async () => {
        const token = Cookies.get("accessToken");
        if (token) {
          const response = await fetchUserInfo(token);
          if (response && typeof response !== "string") {
            console.log("loggin in");
            setUser(response.user);
          }
        }
      })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    const response = await loginUser({ email, password });
    if (response && typeof response !== "string") {
      if (response.user && response.accessToken) {
        Cookies.set("accessToken", response?.accessToken);
        setUser(response.user);
        setAccessToken(response.accessToken);
        setIsOpen(!isOpen);
        return true;
      } else {
        setMessage({ type: "error", message: "Something went wrong!" });
        return false;
      }
    } else if (typeof response === "string") {
      setMessage({ type: "error", message: response });
      return false;
    } else {
      setMessage({ type: "error", message: "Something went wrong!" });
      return false;
    }
  };

  const register = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await registerUser({ name, email, password });
    if (response && typeof response !== "string") {
      if (response.user && response.accessToken) {
        Cookies.set("accessToken", response?.accessToken);
        setUser(response.user);
        setAccessToken(response.accessToken);
        setIsOpen(!isOpen);
        console.log(isOpen);
      }
    } else if (typeof response === "string") {
      setMessage({ type: "error", message: response });
    } else {
      setMessage({ type: "error", message: "Something went wrong!" });
    }
  };

  const logout = async () => {
    Cookies.remove("accessToken");
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        access_token,
        setAccessToken,
        openSigningModal,
        login,
        logout,
        user,
      }}
    >
      {children}
      <Modal
        open={isOpen}
        onCancel={() => {
          if (!loading) setIsOpen(!isOpen);
        }}
        closable={false}
        footer={null}
        className=" max-w-[340px]"
      >
        <div className=" flex flex-col py-10 px-5  rounded-lg gap-10 ">
          {page === "login" && (
            <LoginForm
              setPage={setPage}
              loginUser={login}
              message={message}
              setMessage={setMessage}
              loading={loading}
              setLoading={setLoading}
            />
          )}
          {page === "signup" && (
            <SignupForm setPage={setPage} register={register} />
          )}
          {page === "forgot_password" && (
            <>
              <h1 className=" text-lg text-center">Forgot your password?</h1>
              <div className="flex flex-col gap-4">
                <h1 className="">
                  In case you forgot your password please enter your email.
                </h1>
                <Input placeholder="Email" />
              </div>

              <div className="flex flex-col gap-3 justify-center">
                <Button className="">Send email</Button>
                <Button
                  className=" bg-blue-600 hover:bg-blue-500"
                  onClick={() => setPage("login")}
                >
                  <h1 className="text-white">Log In</h1>
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </AuthContext.Provider>
  );
}

export default AuthProvider;
