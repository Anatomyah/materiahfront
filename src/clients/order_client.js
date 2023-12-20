import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { uploadImagesToS3 } from "./product_client";
import { showToast } from "../config_and_helpers/helpers";

/**
 * Finalize the upload status of an order image.
 *
 * Sends a POST request to the backend API to update the upload status of an order image. Assuming a map structure where the keys are order image IDs and the values are the upload status, and if successful, returns a success status.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Object} uploadStatuses - An object mapping order image IDs to their upload status.
 * @returns {Promise<Object>} An object with a key "success" and a boolean value indicating whether the API call was successful. If it fails, returns an array containing error messages.
 * @throws {Error} Will throw an error if the request fails.
 */
export const finalizeOrderImageUploadStatus = async (token, uploadStatuses) => {
  try {
    // Convert the uploadStatuses object to a FormData instance
    let formData = new FormData();
    for (let key in uploadStatuses) {
      formData.append(key, uploadStatuses[key]);
    }

    // Send a POST request to the backend API to update the images' upload status
    await axios.post(
      `${BACKEND_URL}orders/update_image_upload_status/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data", // Since we're uploading files, we need to set the content type to 'multipart/form-data'
        },
      },
    );

    // On success, return an object indicating the success of the operation
    return { success: true };
  } catch (error) {
    // If the request fails, log and return the error messages
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Create a new order.
 *
 * Sends a POST request to the backend API to create a new order. If the request is successful and there are images associated with the order, each image is uploaded to the S3 bucket. Lastly, uploads the status of each image.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Object} orderData - The data for the new order.
 * @param {Array} images - An array of image objects to be associated with the order.
 * @returns {Promise<Object|Array>} An object with a key "success" indicating whether order and image uploads were successful and "toast" with a function to display a toast message. If the request fails, returns an array with error messages.
 * @throws Will throw an error if the request fails.
 */
export const createOrder = async (token, orderData, images) => {
  try {
    // Post the order data to the server
    const response = await axios.post(`${BACKEND_URL}orders/`, orderData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    let result = { success: true };

    // Check if there are any images associated with the order
    if (images.length) {
      const presignedUrls = response.data.presigned_urls;

      // Check if the response and presigned URLs exist
      if (response && presignedUrls) {
        // Upload each image to S3 then upload the status of each image
        uploadImagesToS3(presignedUrls, images).then((r) => {
          if (r && r.uploadStatuses) {
            finalizeOrderImageUploadStatus(token, r.uploadStatuses).then(
              (r) => {
                if (r && !r.success) {
                  result.success = false;
                }
              },
            );
          } else {
            // If the image upload statuses can't be retrieved, mark the order as not successful
            result.success = false;
          }
        });
      } else {
        // If the response or presigned URLs don't exist, mark the order as not successful
        result.success = false;
      }
    }

    // Function to be called to display a toast notification
    result.toast = () =>
      showToast("Order created successfully!", "success", "top-right");

    // Return the result
    return result;
  } catch (error) {
    // If the request fails, log the error messages and return them
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Update an existing order.
 *
 * Sends a PATCH request to the backend API to update a particular order denoted by orderId with the provided updatedOrderData. If the request is successful and there are images associated with the update, each image is uploaded to the S3 bucket. Lastly, uploads the status for each image.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} orderId - The ID of the order to be updated.
 * @param {Object} updatedOrderData - The updated data of the order.
 * @param {Array} newImages - An array of new image objects to be associated with the order.
 * @returns {Promise<Object|Array>} An object with a key "success" indicating whether order and image uploads were successful and "toast" with a function to display a toast message. If the request fails, returns an array with error messages.
 * @throws Will throw an error if the request fails.
 */
export const updateOrder = async (
  token,
  orderId,
  updatedOrderData,
  newImages,
) => {
  try {
    // Patching the given order with updated data
    const response = await axios.patch(
      `${BACKEND_URL}orders/${orderId}/`,
      updatedOrderData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    let result = { success: true };

    // If any new images need to be uploaded
    if (newImages.length) {
      const presignedUrls = response.data.presigned_urls;

      // Check if the response and presigned URLs exist
      if (response && presignedUrls) {
        // Upload each image to S3 then upload the status of each image
        uploadImagesToS3(presignedUrls, newImages).then((r) => {
          if (r && r.uploadStatuses) {
            finalizeOrderImageUploadStatus(token, r.uploadStatuses).then(
              (r) => {
                if (r && !r.success) {
                  result.success = false;
                }
              },
            );
          } else {
            // If the image upload statuses can't be retrieved, mark the order update as unsuccessful
            result.success = false;
          }
        });
      } else {
        // If the response or presigned URLs don't exist, mark the order update as unsuccessful
        result.success = false;
      }
    }

    // Function to be called to display a toast notification
    result.toast = () =>
      showToast("Order updated successfully!", "success", "top-right");

    // Return the result
    return result;
  } catch (error) {
    // If the request fails, log the error messages and return them
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Delete an existing order.
 *
 * Sends a DELETE request to the backend API to remove a particular order denoted by orderId. If the request is successful, a success response is returned. Otherwise, errors are gathered and returned.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} orderId - The ID of the order to be deleted.
 * @returns {Promise<Object|Array>} An object with a key "success" and a function "toast" to display a toast message if the order deletion is successful. If the request fails, returns an array with error messages.
 * @throws Will throw an error if the request fails.
 */
export const deleteOrder = async (token, orderId) => {
  try {
    // Send a DELETE request to backend API to delete a particular order
    await axios.delete(`${BACKEND_URL}orders/${orderId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // If successful, return a success response
    return {
      success: true,
      toast: () =>
        showToast("Order deleted successfully!", "success", "top-right"),
    };
  } catch (error) {
    // If the request fails, log the error messages and return them
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Retrieve orders.
 *
 * Sends a GET request to the backend API to retrieve a list of all orders. Supports optional pagination and search parameters. If the request is successful, the orders are set in the state.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Function} setOrders - React state's setter function being used to update the Orders state in the component.
 * @param {Object} options - An optional object that can contain nextPage and/or searchInput properties.
 * @returns {Promise<Object|Array>} - An object with a boolean 'success', if the orders are successfully retrieved with either a 'reachedEnd' boolean or 'nextPage' string for next set of results; if not, it returns an array of error messages.
 * @throws Will throw an error if the request fails.
 */
export const getOrders = async (token, setOrders, options = {}) => {
  // Defaults
  const { searchInput = "", nextPage = null } = options;

  // Construct the request URL (check if next page URL exists, otherwise request the first page)
  let url = nextPage ? nextPage : `${BACKEND_URL}orders/?page_num=1`;

  // If a search input is provided add it to request URL as a query parameter
  if (searchInput) {
    url += `&search=${searchInput}`;
  }

  try {
    // Get the orders from the server
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    const nextCursor = response.data.next;

    // If there's no next cursor/page, it means we reached the end of the data
    if (!nextCursor) {
      // Check if it's a request for the next page or the first one
      if (nextPage) {
        // If it's a next page request, append new orders to current order list
        setOrders((prevOrders) => [...prevOrders, ...response.data.results]);
      } else {
        // If it's a request for the first page, reset the order list
        setOrders(response.data.results);
      }
      // Notify that we reached the end of the data
      return { success: true, reachedEnd: true };
    }

    // If it's not the end...
    // Check if it's a next page request or not
    if (!nextPage) {
      // If it's a request for the first page, reset the order list
      setOrders(response.data.results);
    } else {
      // If it's a next page request, append new orders to current order list
      setOrders((prevOrders) => [...prevOrders, ...response.data.results]);
    }

    // Return success state and next page's URL
    return { success: true, nextPage: response.data.next };
  } catch (error) {
    // If the request fails, log the error messages and return them
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Retrieve order details.
 *
 * Sends a GET request to the backend API to retrieve the details of a specific order denoted by orderId. If the request is successful, the order details are set in the state.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} orderId - The ID of the order whose details need to be fetched.
 * @param {Function} setOrderDetails - React state's setter function being used to update the OrderDetails state in the component.
 * @returns {Promise<Object|Array>} An object with a boolean 'success' if the order details are successfully retrieved; if not, it returns an array of error messages.
 * @throws Will throw an error if the request fails.
 */
export const getOrderDetails = async (token, orderId, setOrderDetails) => {
  try {
    // Get the order details from the server
    const response = await axios.get(`${BACKEND_URL}orders/${orderId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Set the retrieved details in state
    setOrderDetails(response.data);

    // Return a success state
    return { success: true };
  } catch (error) {
    // If the request fails, log the error messages and return them
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};
