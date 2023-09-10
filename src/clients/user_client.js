import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

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

    await axios.post(`${BACKEND_URL}users/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error.response.data);
    alert(error);
    return error.response ? error.response.data.detail : "Something went wrong";
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
    }
  } catch (error) {
    console.error(error.response.data);
    alert(error);
    return error.response ? error.response.data.detail : "Something went wrong";
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

export const getPasswordToken = async (email) => {
  try {
    await axios.post(`${BACKEND_URL}api/password_reset/`, { email });
  } catch (error) {
    console.error(error.response.data);
    alert(error);
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};

export const resetPassword = async (token, password) => {
  try {
    await axios.post(`${BACKEND_URL}api/password_reset/confirm/`, {
      token,
      password,
    });
  } catch (error) {
    console.error(error.response.data);
    alert(error);
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};

export const updateUserProfile = async (
  token,
  userId,
  updatedDetails,
  setUserDetails,
  isSupplier = false,
) => {
  let updatedUserData;
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
      email: updatedDetails.email,
      first_name: updatedDetails.firstName,
      last_name: updatedDetails.lastName,
      supplieruserprofile: {
        contact_phone_prefix: updatedDetails.contactPhonePrefix,
        contact_phone_suffix: updatedDetails.contactPhoneSuffix,
      },
    };
  }
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
    setUserDetails(response.data);
  } catch (error) {
    console.error(error);
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};

export const updateSupplierProfile = async (
  token,
  supplierId,
  updatedDetails,
) => {
  let updatedSupplierData = {
    email: updatedDetails.supplierEmail,
    phone_prefix: updatedDetails.supplierPhonePrefix,
    phone_suffix: updatedDetails.supplierPhoneSuffix,
    website: updatedDetails.supplierWebsite,
  };

  try {
    await axios.patch(
      `${BACKEND_URL}suppliers/${supplierId}/`,
      updatedSupplierData,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
  } catch (error) {
    console.error(error.response.data);
    return error.response ? error.response.data.detail : "Something went wrong";
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
  } catch (error) {
    return error;
  }
};

// export const getUserDetails = async (token, setUserDetails) => {
//   try {
//     const response = await axios.get(`${BACKEND_URL}users/`, {
//       headers: {
//         Authorization: `Token ${token}`,
//       },
//     });
//     setUserDetails(response.data.results[0]);
//     console.log(response.data.results[0]);
//     return true;
//   } catch (error) {
//     return error;
//   }
// };
