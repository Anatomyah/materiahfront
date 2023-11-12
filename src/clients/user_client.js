import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const validateToken = async (token) => {
  try {
    await axios.get(`${BACKEND_URL}users/validate_token/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const signup = async (
  userData,
  setToken,
  setUserDetails,
  setNotifications,
) => {
  console.log(userData);
  console.log(setToken);
  try {
    const response = await axios.post(`${BACKEND_URL}users/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    let result = { success: true };

    console.log(setToken);

    if (response) {
      const loginResponse = await login({
        credentials: {
          username: userData.username,
          password: userData.password,
        },
        setToken,
        setUserDetails,
        setNotifications,
      });

      if (loginResponse && !loginResponse.success) {
        return { success: false, message: "Login failed after signup" };
      }

      return { success: true };
    }

    return result;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const login = async ({
  credentials,
  setToken,
  setUserDetails,
  setIsSupplier = () => {},
  setNotifications = () => {},
  rememberMe = false,
}) => {
  try {
    const userData = {
      username: credentials.username,
      password: credentials.password,
    };

    const res = await axios.post(`${BACKEND_URL}api-token-auth/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(res);

    if (res.status === 200 && res.data) {
      setToken(res.data.token);
      setUserDetails(res.data.user_details);
      setNotifications(res.data.notifications);
      if (res.data.user_details.is_supplier) {
        setIsSupplier(true);
      }

      let storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", res.data.token);
      storage.setItem("userDetails", JSON.stringify(res.data.user_details));
      storage.setItem("notifications", JSON.stringify(res.data.notifications));
      storage.setItem("isSupplier", String(res.data.user_details.is_supplier));
      storage.setItem("rememberMe", String(rememberMe));
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const logout = async (token) => {
  try {
    await axios.post(
      `${BACKEND_URL}logout`,
      {},
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    alert(e);
  }
};

export const getPasswordToken = async (email) => {
  try {
    await axios.post(`${BACKEND_URL}api/password_reset/`, { email });
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const resetPassword = async (token, password) => {
  console.log(password);
  try {
    await axios.post(`${BACKEND_URL}api/password_reset/confirm/`, {
      token,
      password,
    });
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const updateUserProfile = async (
  token,
  userId,
  updatedData,
  setUserDetails,
) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}users/${userId}/`,
      updatedData,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    console.log(response.data);
    setUserDetails(response.data);
    return { success: true };
  } catch (error) {
    console.error(error);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const checkUsername = async (value) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_username/?value=${value}`,
    );
    console.log(response.data);
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const checkUsernameAuthRequired = async (token, value) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_username_auth_required/?value=${value}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    console.log(response.data);
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const checkEmail = async (value) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_email/?value=${value}`,
    );
    console.log(response.data);
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const checkEmailAuthRequired = async (token, value) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_email_auth_required/?value=${value}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const checkPhoneAuthRequired = async (token, prefix, suffix) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_phone_auth_required/?prefix=${prefix}&suffix=${suffix}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    console.log(response.data);
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const checkPhoneNumber = async (prefix, suffix) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_phone/?prefix=${prefix}&suffix=${suffix}`,
    );
    console.log(response.data);
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};
