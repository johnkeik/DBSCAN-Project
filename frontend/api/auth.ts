import { User } from "@/types";
import axios, { AxiosResponse } from "axios";
import queryString from "query-string";

export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<
  | {
      user?: User;
      accessToken?: string;
    }
  | string
  | null
> => {
  try {
    const params = queryString.stringify({
      email,
      password,
    });

    const response: AxiosResponse<{ user?: User; accessToken?: string }> =
      await axios.post("http://localhost:8081/api/login", params, {
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
      });

    return response.data;
  } catch (error: any) {
    if (error && error.response && error.response.status === 401) {
      return error.response.data;
    } else {
      return null;
    }
  }
};

export const registerUser = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<
  | {
      message: string;
      user?: User;
      accessToken?: string;
    }
  | string
  | null
> => {
  try {
    const params = queryString.stringify({
      name,
      email,
      password,
    });

    const response: AxiosResponse<
      { message: string; user?: User; accessToken?: string } | string
    > = await axios.post("http://localhost:8081/api/register", params, {
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    return null;
  }
};

export const fetchUserInfo = async (
  token: string
): Promise<{ user: User } | string | null> => {
  try {
    const response: AxiosResponse<{ user: User } | string> = await axios.get(
      "http://localhost:8081/api/fetchUserInfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    return null;
  }
};

export const forgotPassword = async ({
  email,
}: {
  email: string;
}): Promise<{
  status: number;
  message: string;
}> => {
  const params = queryString.stringify({ email });
  try {
    const response: AxiosResponse<{ message: string }> = await axios.post(
      "http://localhost:8081/api/forgotPassword",
      params,
      {
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
      }
    );
    return {
      status: response.status,
      message: response.data.message,
    };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx, return the error message and status
      return {
        status: error.response.status,
        message: error.response.data.message,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      // Return the generic error message and a status of 500
      return {
        status: 500,
        message: error.message,
      };
    }
  }
};
