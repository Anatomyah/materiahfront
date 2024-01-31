import { BACKEND_URL } from "../config_and_helpers/config";
import axios from "axios";
import { showToast } from "../config_and_helpers/helpers";

/**
 * Fetches order notifications from the backend API.
 *
 * @param {string} token - The authentication token.
 * @param {function} setOrderNotifications - The function to set the order notifications.
 * @param {object} options - Optional parameters.
 * @param {string} options.searchInput - The search input provided by the user.
 * @param {string} options.supplierId - The supplier ID.
 * @param {string} options.nextPage - The URL of the next page.
 * @returns {Promise<{ success: boolean, nextPage: string }>} The success status and the URL of the next page.
 * @throws {Error} If an error occurs during the request.
 */
export const getOrderNotifications = async (
  token,
  setOrderNotifications,
  options = {},
) => {
  const { searchInput = "", supplierId = "", nextPage = null } = options;

  // Construct the request URL, initially pointing to first page of order notifications
  let url = nextPage
    ? nextPage
    : `${BACKEND_URL}order_notifications/?page_num=1`;

  // Add a search parameter to the URL if there's any search input given by user
  if (searchInput) {
    url += `&search=${searchInput}`;
  }
  if (supplierId) {
    url += `&supplier_id=${supplierId}`;
  }

  try {
    // Send a GET request to fetch the list of order notifications
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Extract 'next' object from response data for pagination
    const nextCursor = response.data.next;

    // If there's no nextCursor available, then either it's a nextPage request or end of order notifications list
    // is reached in both cases update setNotifications accordingly
    if (!nextCursor) {
      if (nextPage) {
        setOrderNotifications((prevOrderNotifications) => [
          ...prevOrderNotifications,
          ...response.data.results,
        ]);
      } else {
        setOrderNotifications(response.data.results);
      }
      return { success: true, reachedEnd: true };
    }

    // If it's a nextPage request, then merge old results with new ones
    // Otherwise update all processes with new results
    if (!nextPage) {
      setOrderNotifications(response.data.results);
    } else {
      setOrderNotifications((prevOrderNotifications) => [
        ...prevOrderNotifications,
        ...response.data.results,
      ]);
    }

    // If there are more order notifications to be displayed in next pages return the
    // success status as true and the url for next page of order notifications
    return { success: true, nextPage: response.data.next };
  } catch (error) {
    // Log and return any errors that occurred during the request
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Deletes an order notification from the backend.
 *
 * @async
 * @param {string} token - The user's authentication token.
 * @param {number} notificationId - The ID of the notification to delete.
 * @returns {Promise<{ success: boolean, toast: Function } | Array<string>>} - A promise that resolves to an object with a success flag and a toast function if the deletion is successful
 *, or an array of error messages if the deletion fails.
 */
export const deleteOrderNotification = async (token, notificationId) => {
  try {
    await axios.delete(`${BACKEND_URL}order_notifications/${notificationId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return {
      success: true,
      toast: () =>
        showToast(
          "Order notification deleted successfully!",
          "success",
          "top-right",
          3000,
        ),
    };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Fetches expiry notifications from the backend API.
 *
 * @async
 * @param {string} token - The user's access token.
 * @param {function} setExpiryNotifications - A function to update the expiry notifications in the state.
 * @param {object} options - Additional options for fetching the expiry notifications.
 * @param {string} options.searchInput - The search input provided by the user.
 * @param {string} options.supplierId - The ID of the supplier to filter expiry notifications.
 * @param {string} options.nextPage - The URL for the next page of expiry notifications.
 * @returns {object} - The result of the fetch operation, including success status and pagination information.
 * @throws {Error} - If an error occurs during the request.
 */
export const getExpiryNotifications = async (
  token,
  setExpiryNotifications,
  options = {},
) => {
  const { searchInput = "", supplierId = "", nextPage = null } = options;

  // Construct the request URL, initially pointing to first page of expiry notifications
  let url = nextPage
    ? nextPage
    : `${BACKEND_URL}expiry_notifications/?page_num=1`;

  // Add a search parameter to the URL if there's any search input given by user
  if (searchInput) {
    url += `&search=${searchInput}`;
  }
  if (supplierId) {
    url += `&supplier_id=${supplierId}`;
  }

  try {
    // Send a GET request to fetch the list of expiry notifications
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Extract 'next' object from response data for pagination
    const nextCursor = response.data.next;

    // If there's no nextCursor available, then either it's a nextPage request or end of expiry notifications list
    // is reached in both cases update setNotifications accordingly
    if (!nextCursor) {
      if (nextPage) {
        setExpiryNotifications((prevExpiryNotifications) => [
          ...prevExpiryNotifications,
          ...response.data.results,
        ]);
      } else {
        setExpiryNotifications(response.data.results);
      }
      return { success: true, reachedEnd: true };
    }

    // If it's a nextPage request, then merge old results with new ones
    // Otherwise update all processes with new results
    if (!nextPage) {
      setExpiryNotifications(response.data.results);
    } else {
      setExpiryNotifications((prevExpiryNotifications) => [
        ...prevExpiryNotifications,
        ...response.data.results,
      ]);
    }

    // If there are more expiry notifications to be displayed in next pages return the
    // success status as true and the url for next page of expiry notifications
    return { success: true, nextPage: response.data.next };
  } catch (error) {
    // Log and return any errors that occurred during the request
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Delete the expiry notification with the given ID.
 *
 * @param {string} token - The authentication token.
 * @param {string} notificationId - The ID of the expiry notification to delete.
 * @returns {Promise<Object>} - A Promise that resolves to an object with a success flag and a toast function if successful, or an array of error messages if unsuccessful.
 * @throws {Error} - If an error occurs during the delete operation.
 * @throws {AxiosError} - If an error occurs while making the delete request.
 */
export const deleteExpiryNotification = async (token, notificationId) => {
  try {
    await axios.delete(
      `${BACKEND_URL}expiry_notifications/${notificationId}/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    return {
      success: true,
      toast: () =>
        showToast(
          "Expiry notification deleted successfully!",
          "success",
          "top-right",
          3000,
        ),
    };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};
