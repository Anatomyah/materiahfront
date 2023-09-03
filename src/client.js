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

export const updateUserProfile = async (
  token,
  userId,
  updatedDetails,
  isSupplier = false,
) => {
  let updatedUserData = {};
  console.log(updatedDetails);
  if (!isSupplier) {
    updatedUserData = {
      email: updatedDetails.email,
      first_name: updatedDetails.firstName,
      last_name: updatedDetails.lastName,
      userprofile: {
        phone_prefix: updatedDetails.phonePrefix,
        phone_suffix: updatedDetails.phoneSuffix,
      },
    };
  } else {
    updatedUserData = {
      email: updatedDetails.contactEmail,
      first_name: updatedDetails.firstName,
      last_name: updatedDetails.lastName,
      supplieruserprofile: {
        contact_phone_prefix: updatedDetails.contactPhonePrefix,
        contact_phone_suffix: updatedDetails.contactPhoneSuffix,
      },
    };
  }
  console.log(updatedUserData);
  try {
    const response = await axios.patch(
      `${BACKEND_URL}users/${userId}/`,
      updatedUserData,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    console.log(response.data);
    return true;
  } catch (error) {
    console.error(error);
    return error.response ? error.response.data : "Something went wrong";
  }
};

export const updateSupplierProfile = async (
  token,
  supplierId,
  updatedDetails,
) => {
  let updatedSupplierData = {
    email: updatedDetails.email,
    phone_prefix: updatedDetails.phonePrefix,
    phone_suffix: updatedDetails.phoneSuffix,
  };

  try {
    const response = await axios.patch(
      `${BACKEND_URL}suppliers/${supplierId}/`,
      updatedSupplierData,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    console.log(response.data);
    return true;
  } catch (error) {
    console.error(error);
    return error.response ? error.response.data : "Something went wrong";
  }
};
