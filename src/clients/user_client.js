import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { showToast } from "../config_and_helpers/helpers";

/**
 * Validates the authentication token of a user.
 *
 * This function sends a GET request to the backend API to validate the user's authentication token.
 * If the request is successful, it indicates that the token is valid, and the function returns an object
 * with a 'success' key set to true. If the token is not valid or the request fails, it returns an
 * object with the 'success' key set to false.
 *
 * @async
 * @param {string} token - The authentication token of the user to validate.
 * @returns {Promise<Object>} - An object representing validation success status.
 */
export const validateToken = async (token) => {
  // Try to send a GET request to validate the token
  try {
    await axios.get(`${BACKEND_URL}users/validate_token/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // If the request is successful, return an object with success set to true
    return { success: true };

    // If any error occurs during the token validation
  } catch (error) {
    // Return an object with success set to false
    return { success: false };
  }
};

/**
 * Registers a new user.
 *
 * This function sends a POST request to the backend API with the user details to register a new user.
 * After the user is successfully registered, it attempts to log in the new user.
 * If the user registration and login are both successful, it returns an object with the 'success' key set to true.
 * If the registration or the login fails, it returns an error message.
 *
 * @async
 * @param {Object} userData - The details of the new user to register.
 * @param {function} setToken - The function to set the user's authentication token.
 * @param {function} setUserDetails - The function to set the details of the user.
 * @param {function} setNotifications - The function to set the user's notifications.
 * @returns {Promise<Object>} - An object representing registration and login success status.
 * @throws Will throw an error if the registration request fails.
 */
export const signup = async (
  userData,
  setToken,
  setUserDetails,
  setNotifications,
) => {
  // Try to send a POST request to register a new user
  try {
    const response = await axios.post(`${BACKEND_URL}users/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    let result = { success: true };

    // After the user is successfully registered, attempt to log in the new user
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

      // If the login fails after successfully registering
      if (loginResponse && !loginResponse.success) {
        return { success: false, message: "Login failed after signup" };
      }

      // If registration and login are both successful
      return { success: true };
    }

    // Return the result
    return result;

    // If any error occurs during the registration or login
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Logs in a user.
 *
 * This function sends a POST request to the backend API with the user's credentials to log in a user.
 * It also sets or updates the user's token, details, supplier status, and notifications in the respective hooks functions and local storage or session storage,
 * depending on whether the user chooses to remember the login information.
 * If the login is successful, it returns an object with the 'success' key set to true. If the login fails, it returns an error message.
 *
 * @async
 * @param {Object} parameters - The object that contains user's credentials, hooks functions and remember me status.
 * @param {Object} parameters.credentials - The username and password of the user.
 * @param {function} parameters.setToken - The function to set the user's authentication token.
 * @param {function} parameters.setUserDetails - The function to set the details of the user.
 * @param {function} parameters.setIsSupplier - The function to set the user's supplier status.
 * @param {function} parameters.setNotifications - The function to set the user's notifications.
 * @param {boolean} parameters.rememberMe - Whether to remember the user's login information or not.
 * @returns {Promise<Object>} - An object representing the login success status.
 * @throws Will throw an error if the login request fails.
 */
export const login = async ({
  credentials,
  setToken,
  setUserDetails,
  setIsSupplier = () => {},
  setNotifications = () => {},
  rememberMe = false,
}) => {
  // Prepare user credentials
  const userData = {
    username: credentials.username,
    password: credentials.password,
  };

  // Try to send a POST request to log in the user
  try {
    const res = await axios.post(`${BACKEND_URL}api-token-auth/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // If login is successful
    if (res.status === 200 && res.data) {
      // Update the user's token, details, and notifications
      setToken(res.data.token);
      setUserDetails(res.data.user_details);
      setNotifications(res.data.notifications);

      // If the user is a supplier, set the supplier status
      if (res.data.user_details.is_supplier) {
        setIsSupplier(true);
      }

      // Choose the appropriate web storage depending on rememberMe
      let storage = rememberMe ? localStorage : sessionStorage;

      // Store the user's token, details, supplier status, and notifications in web storage
      storage.setItem("token", res.data.token);
      storage.setItem("userDetails", JSON.stringify(res.data.user_details));
      storage.setItem("notifications", JSON.stringify(res.data.notifications));
      storage.setItem("isSupplier", String(res.data.user_details.is_supplier));
      storage.setItem("rememberMe", String(rememberMe));
    }

    // Return an object indicating success
    return { success: true };

    // If any error occurs during the login
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Logs out a user.
 *
 * This function sends a POST request to the backend API to log out a user and then clears the local and session storages.
 * If the logout is successful, it returns an object with the 'success' key set to true. If the logout fails, it returns an error message.
 *
 * @async
 * @param {string} token - The authentication token of the user to logout.
 * @returns {Promise<Object>} - An object representing the logout success status.
 * @throws Will throw an error if the logout request fails.
 */
export const logout = async (token) => {
  // Try to send a POST request to log out the user
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
    // Clear the local and session storages after logout
    localStorage.clear();
    sessionStorage.clear();

    // Return an object indicating success
    return { success: true };

    // If any error occurs during the logout
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Requests a password reset token for a user.
 *
 * This function sends a POST request to the backend API with the user's email to request a password reset token.
 * If the request is successful, it returns an object with the 'success' key set to true. If the request fails, it returns an error message.
 *
 * @async
 * @param {string} email - The email of the user to request a password reset token.
 * @returns {Promise<Object>} - An object representing the password reset token request success status.
 * @throws Will throw an error if the password reset token request fails.
 */
export const getPasswordToken = async (email) => {
  // Try to send a POST request to request a password reset token
  try {
    await axios.post(`${BACKEND_URL}api/password_reset/`, { email });

    // If the request is successful
    return { success: true };

    // If any error occurs during the request
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Resets a user's password.
 *
 * This function sends a POST request to the backend API with the password reset token and the new password to reset a user's password.
 * If the password reset request is successful, it returns an object with the 'success' key set to true. If the request fails, it returns an error message.
 *
 * @async
 * @param {string} token - The password reset token of the user to reset the password.
 * @param {string} password - The new password of the user.
 * @returns {Promise<Object>} - An object representing the password reset success status.
 * @throws Will throw an error if the password reset request fails.
 */
export const resetPassword = async (token, password) => {
  // Try to send a POST request to reset the password
  try {
    await axios.post(`${BACKEND_URL}api/password_reset/confirm/`, {
      token,
      password,
    });

    // If the password reset request is successful
    return { success: true };

    // If any error occurs during the password reset request
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Updates a user's profile.
 *
 * This function sends a PATCH request to the backend API with the updated user information to update a user's profile.
 * After a successful update, it also updates the user's details using the setUserDetails function.
 * If the update is successful, it returns an object with the 'success' key set to true and a function to show a success toast message.
 * If the update fails, it returns an error message.
 *
 * @async
 * @param {string} token - The authentication token of the user.
 * @param {string} userId - The ID of the user to update.
 * @param {Object} updatedData - The updated user information.
 * @param {function} setUserDetails - The function to set the updated details of the user.
 * @returns {Promise<Object>} - An object representing the update success status and a function to show a success toast message.
 * @throws Will throw an error if the update request fails.
 */
export const updateUserProfile = async (
  token,
  userId,
  updatedData,
  setUserDetails,
) => {
  // Try to send a PATCH request to update the user's profile
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

    // Update the user's details
    setUserDetails(response.data);

    return {
      success: true,
      // Show a success toast message when called
      toast: () =>
        showToast(
          "Account details edited successfully!",
          "success",
          "top-right",
        ),
    };

    // If any error occurs during the update request
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Checks if a username is unique.
 *
 * This function sends a GET request to the backend API to query if a username is unique.
 * If the request is successful, it returns a boolean indicating whether the username is unique or not.
 * If the request fails, it returns an error message.
 *
 * @async
 * @param {string} value - The username to check.
 * @returns {Promise<boolean | Object>} - True if the username is unique, false if not, or an object representing the error message if the request fails.
 * @throws Will throw an error if the request fails.
 */
export const checkUsername = async (value) => {
  // Try to send a GET request to check if the username is unique
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_username/?value=${value}`,
    );

    // Return whether the username is unique or not
    return response.data.unique;

    // If any error occurs during the request
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Checks if a username is unique (requires authentication).
 *
 * This function sends a GET request to the backend API to query if a username is unique. This operation requires authentication.
 * If the request is successful, it returns a boolean indicating whether the username is unique or not.
 * If the request fails, it returns an error message.
 *
 * @async
 * @param {string} token - The authentication token of the user.
 * @param {string} value - The username to check.
 * @returns {Promise<boolean | Object>} - True if the username is unique, false if not, or an object representing the error message if the request fails.
 * @throws Will throw an error if the request fails.
 */
export const checkUsernameAuthRequired = async (token, value) => {
  // Try to send a GET request to check if the username is unique
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_username_auth_required/?value=${value}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // Return whether the username is unique or not
    return response.data.unique;

    // If any error occurs during the request
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Checks if an email is unique.
 *
 * This function sends a GET request to the backend API to query if an email is unique.
 * If the request is successful, it returns a boolean indicating whether the email is unique or not.
 * If the request fails, it returns an error message.
 *
 * @async
 * @param {string} value - The email to check.
 * @returns {Promise<boolean | Object>} - True if the email is unique, false if not, or an object representing the error message if the request fails.
 * @throws Will throw an error if the request fails.
 */
export const checkEmail = async (value) => {
  // Try to send a GET request to check if the email is unique
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_email/?value=${value}`,
    );

    // Return whether the email is unique or not
    return response.data.unique;

    // If any error occurs during the request
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Checks if an email is unique (requires authentication).
 *
 * This function sends a GET request to the backend API to query if an email is unique. This operation requires authentication.
 * If the request is successful, it returns a boolean indicating whether the email is unique or not.
 * If the request fails, it returns an error message.
 *
 * @async
 * @param {string} token - The authentication token of the user.
 * @param {string} value - The email to check.
 * @returns {Promise<boolean | Object>} - True if the email is unique, false if not, or an object representing the error message if the request fails.
 * @throws Will throw an error if the request fails.
 */
export const checkEmailAuthRequired = async (token, value) => {
  // Try to send a GET request to check if the email is unique
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_email_auth_required/?value=${value}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // Return whether the email is unique or not
    return response.data.unique;

    // If any error occurs during the request
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Checks if a phone number is unique (requires authentication).
 *
 * This function sends a GET request to the backend API to query if a phone number is unique. This operation requires authentication.
 * The phone number is divided into two parts: the prefix and the suffix.
 * If the request is successful, it returns a boolean indicating whether the phone number is unique or not.
 * If the request fails, it returns an error message.
 *
 * @async
 * @param {string} token - The authentication token of the user.
 * @param {string} prefix - The prefix part of the phone number to check.
 * @param {string} suffix - The suffix part of the phone number to check.
 * @returns {Promise<boolean | Object>} - True if the phone number is unique, false if not, or an object representing the error message if the request fails.
 * @throws Will throw an error if the request fails.
 */
export const checkPhoneAuthRequired = async (token, prefix, suffix) => {
  // Try to send a GET request to check if the phone number is unique
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_phone_auth_required/?prefix=${prefix}&suffix=${suffix}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // Return whether the phone number is unique or not
    return response.data.unique;

    // If any error occurs during the request
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};

/**
 * Checks if a phone number is unique.
 *
 * This function sends a GET request to the backend API to query if a phone number is unique.
 * The phone number is divided into two parts: the prefix and the suffix.
 * If the request is successful, it returns a boolean indicating whether the phone number is unique or not.
 * If the request fails, it returns an error message.
 *
 * @async
 * @param {string} prefix - The prefix part of the phone number to check.
 * @param {string} suffix - The suffix part of the phone number to check.
 * @returns {Promise<boolean | Object>} - True if the phone number is unique, false if not, or an object representing the error message if the request fails.
 * @throws Will throw an error if the request fails.
 */
export const checkPhoneNumber = async (prefix, suffix) => {
  // Try to send a GET request to check if the phone number is unique
  try {
    const response = await axios.get(
      `${BACKEND_URL}users/check_phone/?prefix=${prefix}&suffix=${suffix}`,
    );

    // Return whether the phone number is unique or not
    return response.data.unique;

    // If any error occurs during the request
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message
    return Object.values(error.response.data);
  }
};
