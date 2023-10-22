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

export const signup = async (userData) => {
  try {
    console.log(userData);
    await axios.post(`${BACKEND_URL}users/`, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const fetchNotifications = async (token, setNotifications) => {
  try {
    const res = await axios.get(`${BACKEND_URL}products/serve_notifications`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    console.log(res.data);
    setNotifications(res.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const login = async (
  credentials,
  setToken,
  setUserDetails,
  setIsSupplier,
  setNotifications,
  rememberMe,
) => {
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
    setUserDetails(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const getSupplierProducts = async (
  token,
  setSupplierCatalogue,
  setTotalPages,
  page = 1,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}products/?page_num=${page}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    console.log(response.data.results);
    setSupplierCatalogue(response.data.results);
    setTotalPages(response.data.total_pages);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};
