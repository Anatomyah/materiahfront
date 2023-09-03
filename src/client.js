import axios from "axios";
import { BACKEND_URL } from "./config";

export const signup = async (userInfo) => {
  try {
    const userData = {
      username: userInfo.username,
      email: userInfo.email,
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      password: userInfo.password1,
      confirm_password: userInfo.password2,
      userprofile: {
        phone_prefix: userInfo.phonePrefix,
        phone_suffix: userInfo.phoneSuffix,
        id_number: userInfo.idNumber,
      },
    };

    const res = await axios.post(`${BACKEND_URL}users/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.status === 201) {
      return true;
    }
  } catch (e) {
    alert(e);
    return false;
  }
};

export const login = async (
  credentials,
  setToken,
  setUserDetails,
  setIsSupplier,
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
      if (res.data.user_details.is_supplier) {
        setIsSupplier(true);
      }
      console.log(res.data.user_details);
      return true;
    }
  } catch (e) {
    return false;
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
  } catch (e) {
    alert(e);
  }
};

export const getPasswordToken = (email) => {
  axios
    .post(`${BACKEND_URL}api/password_reset/`, {
      email: email,
    })
    .then((response) => {
      return true;
    })
    .catch((error) => {
      return error;
    });
};

export const resetPassword = (token, password) => {
  axios
    .post(`${BACKEND_URL}api/password_reset/confirm/`, {
      token: token,
      password: password,
    })
    .then((response) => {
      return true;
    })
    .catch((error) => {
      return error;
    });
};

export const updateUserDetails = (token, updatedDetails, isSupplier) => {
  if (!isSupplier) {
    console.log("supplier details");
  } else {
    console.log("userprofile details");
  }
  axios
    .patch(`${BACKEND_URL}users/`, { updatedDetails })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
};
