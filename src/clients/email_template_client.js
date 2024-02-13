import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { showToast } from "../config_and_helpers/helpers";

/**
 * Fetches the email HTML template from the backend API.
 *
 * @param {string} token - The authorization token for the API.
 * @param {function} setTemplate - The function to set the fetched template.
 * @returns {object} - An object representing the result of the operation.
 *                    The object contains a 'success' property indicating whether the
 *                    operation was successful.
 *                    If the operation fails, an error object is returned.
 */
export const getEmailHTMLTemplate = async (token, setTemplate) => {
  try {
    // Send a GET request to the backend API to fetch the current signature template
    const response = await axios.get(`${BACKEND_URL}fetch_email_signature/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Set the returned template into the HTML template state management
    setTemplate(response.data.signature);

    // return indication of success
    return {
      success: true,
    };
  } catch (error) {
    // If the request fails, the error responses are logged and returned
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Update the email HTML template
 * @param {string} token - Authentication token
 * @param {string} template - Email HTML template to be updated
 * @returns {Promise} - Promise that resolves to an object with success status and toast function
 * @throws {Error} - If the request fails, error responses are logged and returned
 */
export const updateEmailHTMLTemplate = async (token, template) => {
  try {
    // Send a POST request to the backend API along with the new signature template content
    await axios.post(
      `${BACKEND_URL}update_email_signature/`,
      {
        template: template,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // If successful, return a object indicating this and the relevant toast function
    return {
      success: true,
      toast: () =>
        showToast(
          "Email template updated successfully!",
          "success",
          "top-right",
          3000,
        ),
    };
  } catch (error) {
    // If the request fails, the error responses are logged and returned
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};
