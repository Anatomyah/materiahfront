import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { showToast } from "../config_and_helpers/helpers";

/**
 * Update the upload status of a quote.
 *
 * This function sends a POST request to the 'quotes/update_quote_upload_status/' endpoint of the backend API, providing the quoteId and
 * an uploadStatus value. The quoteId is used to identify the quote and the uploadStatus value informs the backend as to what the
 * new status value is.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {number} quoteId - The ID of quote to finalize the upload status for.
 * @param {string} uploadStatus - The new upload status, 'completed' or 'failed'.
 * @returns {Promise<Object>} An object with a boolean 'success' attribute. If the update is not successful, it returns an array of error messages.
 * @throws Will throw an error if the quote upload status update request fails.
 */
export const finalizeQuoteUploadStatus = async (
  token,
  quoteId,
  uploadStatus,
) => {
  try {
    // Make a POST request to the backend API endpoint to update the quote upload status
    await axios.post(
      `${BACKEND_URL}quotes/update_quote_upload_status/`,
      // This time, the quote_id and status are sent as JSON payload in a POST request.
      { quote_id: quoteId, status: uploadStatus },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // If the request is successful and the status got updated, return a success status
    return { success: true };

    // If any error occurs during the status update
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Upload a file for a specific quote to Amazon S3.
 *
 * This function takes as arguments a presignedPostData object (containing details about the S3 upload) and a file to be uploaded.
 * It creates a FormData object to hold the details from presignedPostData and the file. Then it sends this FormData object to the
 * presigned URL (which is obtained from presignedPostData) via a POST request. If the request is successful, it returns an object indicating
 * that the upload status is 'completed'. If the request is not successful, it returns an object indicating that the upload status is 'failed'.
 *
 * @async
 * @param {Object} presignedPostData - The pre-signed POST data from AWS S3.
 * @param {File} file - The file to upload.
 * @returns {Promise<Object>} - An object with the `uploadStatus` of the file ('completed' or 'failed'). Any error messages are converted into an array and returned.
 * @throws Will throw an error if the file upload request fails.
 */
export const uploadQuoteFileToS3 = async (presignedPostData, file) => {
  // Create a new FormData instance
  const formData = new FormData();

  // Iterate over the presignedPostData fields
  // and append each field to the formData object.
  Object.keys(presignedPostData.fields).forEach((key) => {
    formData.append(key, presignedPostData.fields[key]);
  });

  // Append the file to the formData object
  formData.append("file", file);

  // Try to send the formData to the presigned URL via POST
  try {
    const response = await axios.post(presignedPostData.url, formData);

    // If the status code of the response is in the success range (200-299)
    // return an object with `uploadStatus` set to "completed"
    if (response.status >= 200 && response.status < 300) {
      return { uploadStatus: "completed" };

      // If the status code of the response is not in the success range
      // return an object with `uploadStatus` set to "failed"
    } else {
      return { uploadStatus: "failed" };
    }

    // If an error occurs during the file upload
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Create a quote based on the items in the cart.
 *
 * This function takes an authentication token and a list of cart items as an argument. It sends a POST request to the
 * backend API endpoint '/quotes/' with a JSON stringified cart items' data in the request body. If the request is successful,
 * it returns an object with a 'success' attribute and a 'toast' method that, when called,
 * shows a success toast about the successful shopping. If any error occurs, it returns the array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Array} cartItems - The list of items in the cart.
 * @returns {Promise<Object>} - An object with a boolean `success` attribute and a `toast` method. For unsuccessful actions, it returns an array of error messages.
 * @throws Will throw an error if the create quote request fails.
 */
export const createQuoteFromCart = async (token, cart_items) => {
  // Try to send a POST request to the backend API to create a new quote
  try {
    await axios.post(
      `${BACKEND_URL}quotes/`,
      // JSON.stringify is used to convert the JavaScript object of cart items into a JSON string
      JSON.stringify(cart_items),
      // The `headers` contain the bearer token for authentication and the content type of the body
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    // If the request is successful, return an object with a 'success' attribute and a 'toast' method
    // The 'toast' method shows a success toast about the successful shopping when called
    return {
      success: true,
      toast: () => showToast("Shopping Successful!", "success", "top-right"),
    };

    // If any error occurs during the creation of the quote
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Manually create a quote.
 *
 * This function sends a POST request to the backend API to create a new quote using the provided quoteData. If quoteFile is provided, this function attempts
 * to upload the file to Amazon S3 using the presigned URL and quoteId returned by the backend, and update the upload status of the quote.
 * If everything goes as planned, it returns an object with the keys 'success' (true) and 'toast' (a function that shows a success toast). However, if any step fails,
 * it returns an object with 'success' set to false.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Object} quoteData - The data for the quote to create.
 * @param {File} quoteFile - The attached file for the quote.
 * @returns {Promise<Object>} - An object with a boolean 'success' attribute and a 'toast' function. For unsuccessful actions, it returns an array of error messages.
 * @throws Will throw an error if the create quote request or any subsequent action fails.
 */
export const createQuoteManually = async (token, quoteData, quoteFile) => {
  // Try to send a POST request to create a new quote with the provided data
  try {
    const response = await axios.post(`${BACKEND_URL}quotes/`, quoteData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // Prepare the result object with a success status
    let result = { success: true };

    // If a quote file is provided
    if (quoteFile) {
      // Get the presigned URL and quote ID from the response
      const presignedUrl = response.data.presigned_url;
      const quoteId = response.data.id;

      // If the response is valid and contains presignedUrl and quoteId
      if (response && presignedUrl && quoteId) {
        // Upload the quote file to S3
        uploadQuoteFileToS3(presignedUrl, quoteFile).then((r) => {
          // If the upload is successful, finalize quote upload status
          if (r && r.uploadStatus) {
            finalizeQuoteUploadStatus(token, quoteId, r.uploadStatus).then(
              (r) => {
                // If there is a response but success is not true, change the success status of the result to false
                if (r && !r.success) {
                  result.success = false;
                }
              },
            );
          } else {
            // If the upload was not successful, set the success status to false
            result.success = false;
          }
        });
      } else {
        // If response, presignedUrl, or quoteId are invalid, set the success status to false
        result.success = false;
      }
    }

    // Prepare a toast message for successful quote creation
    result.toast = () =>
      showToast("Quote created successfully!", "success", "top-right");

    // Return the result
    return result;

    // If any error occurs during the creation of the quote
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Update an existing quote.
 *
 * This function sends a PATCH request to the backend API to update an existing quote using the quoteId and updatedQuoteData.
 * If quoteFile is provided, the function attempts to upload the file to Amazon S3 using the presigned URL and quoteId returned by the backend,
 * and update the upload status of the quote.
 * If everything goes as planned, it returns an object with the keys 'success' (true) and 'toast' (a function that shows a success toast).
 * However, if any step fails, it returns an object with 'success' set to false.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} quoteId - The ID of the quote to update.
 * @param {Object} updatedQuoteData - The data for the quote to update.
 * @param {File} quoteFile - The attached file for the quote.
 * @returns {Promise<Object>} - An object with a boolean 'success' attribute and a 'toast' function. For unsuccessful actions, it returns an array of error messages.
 * @throws Will throw an error if the update quote request or any subsequent action fails.
 */
export const updateQuote = async (
  token,
  quoteId,
  updatedQuoteData,
  quoteFile,
) => {
  // Try to send a PATCH request to update a quote with the specified quoteId
  try {
    const response = await axios.patch(
      `${BACKEND_URL}quotes/${quoteId}/`,
      updatedQuoteData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    // Prepare the result object with a success status
    let result = { success: true };

    // If a new quote file is attached
    if (quoteFile) {
      // Extract the presigned URL and quote ID from the response
      const presignedUrl = response.data.presigned_url;
      const quoteId = response.data.id;

      // If the response is valid and contains presignedUrl and quoteId
      if (response && presignedUrl && quoteId) {
        // Upload the new quote file to S3
        uploadQuoteFileToS3(presignedUrl, quoteFile).then((r) => {
          // If the upload is successful, finalize quote upload status
          if (r && r.uploadStatus) {
            finalizeQuoteUploadStatus(token, quoteId, r.uploadStatus).then(
              (r) => {
                // If there is a response but success is not true, change the success status of the result to false
                if (r && !r.success) {
                  result.success = false;
                }
              },
            );
          } else {
            // If the upload was not successful, set the success status to false
            result.success = false;
          }
        });
      } else {
        // If response, presignedUrl, or quoteId are invalid, set the success status to false
        result.success = false;
      }
    }

    // Prepare a toast message for successful quote update
    result.toast = () =>
      showToast("Quote updated successfully!", "success", "top-right");

    // Return the result
    return result;

    // If any error occurs during the quote update
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Delete a quote.
 *
 * This function sends a DELETE request to the backend API to delete an existing quote using the quoteId.
 * If the request is successful, it returns an object with the keys 'success' (true) and 'toast' (a function that shows a success toast).
 * If any step fails, it returns an array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} quoteId - The ID of the quote to delete.
 * @returns {Promise<Object>} - An object with a boolean 'success' attribute and a 'toast' function. For unsuccessful actions, it returns an array of error messages.
 * @throws Will throw an error if the delete quote request fails.
 */
export const deleteQuote = async (token, quoteId) => {
  // Try to send a DELETE request to delete a specific quote using the provided quoteId
  try {
    await axios.delete(`${BACKEND_URL}quotes/${quoteId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // If the request is successful, return an object with success set to true and a toast function
    // which shows a success toast when the quote has been deleted
    return {
      success: true,
      toast: () =>
        showToast("Quote deleted successfully!", "success", "top-right"),
    };

    // If any error occurs during the deletion
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Fetch a list of quotes.
 *
 * This function sends a GET request to the backend API to fetch a list of quotes. Optionally, a search input text might be added to the request
 * URL to implement search functionality. The fetched quotes are stored using the setQuotes function (most likely setting the state in a React component).
 * The function fetches from the next page as long as there is one. It returns an object indicating the success of the operation and the URL of the next page,
 * if it exists. If there is no next page, it returns an object indicating the success of the operation and that the end has been reached.
 * Any errors during the request are logged and returned.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Function} setQuotes - Function updating the `quotes` state.
 * @param {Object} options - Optional parameters for the request. It could include `searchInput` for search functionality and `nextPage` for pagination.
 * @returns {Promise<Object>} - An object with a boolean 'success' attribute, possibly including 'nextPage' and/or 'reachedEnd' attributes. Returns an array of error messages if unsuccessful.
 * @throws Will throw an error if the GET request fails.
 */
export const getQuotes = async (token, setQuotes, options = {}) => {
  // Extract searchInput and nextPage from options
  const { searchInput = "", nextPage = null } = options;

  // If nextPage is provided, use it as the URL; otherwise, start on the first page
  let url = nextPage ? nextPage : `${BACKEND_URL}quotes/?page_num=1`;

  // If there is a search input, add it to the URL
  if (searchInput) {
    url += `&search=${searchInput}`;
  }

  // Attempt to send a GET request to the url
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Save the URL for the next page, if there is one
    const nextCursor = response.data.next;

    // If there is no next page...
    if (!nextCursor) {
      // If it's not the first page, append the new quotes to the existing list
      if (nextPage) {
        setQuotes((prevQuotes) => [...prevQuotes, ...response.data.results]);
      } else {
        // If it is the first page, replace the existing list with the new quotes
        setQuotes(response.data.results);
      }

      // Return an object indicating success and that the end has been reached
      return { success: true, reachedEnd: true };
    }

    // If it's the first page, replace the existing list with the new quotes
    if (!nextPage) {
      setQuotes(response.data.results);
    } else {
      // If it's not the first page, append the new quotes to the existing list
      setQuotes((prevQuotes) => [...prevQuotes, ...response.data.results]);
    }

    // Return an object indicating success and the URL of the next page
    return { success: true, nextPage: response.data.next };

    // If any error occurs during the GET request...
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Retrieve the details of a specific quote.
 *
 * This function sends a GET request to the backend API to retrieve the details of a specific quote using its quoteId.
 * It accepts a token, a quoteId, and a callback function for setting quote details as arguments.
 * The response from the API is then used to update the quote details. The function returns an object with 'success' (true) key.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} quoteId - The ID of the quote.
 * @param {function} setQuoteDetails - The function to set quote details state.
 * @returns {Promise<Object>} - An object with 'success' key.
 * @throws Will throw an error if the get quote details request fails.
 */
export const getQuoteDetails = async (token, quoteId, setQuoteDetails) => {
  // Try to send a GET request to retrieve the details of a specific quote using the provided quoteId
  try {
    const response = await axios.get(`${BACKEND_URL}quotes/${quoteId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // If the request is successful, use the response to update quote details
    setQuoteDetails(response.data);
    // Return an object with success set to true
    return { success: true };

    // If any error occurs during the retrieval of the quote details
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Retrieve a list of open quotes for select list.
 *
 * This function sends a GET request to the backend API to retrieve a list of open quotes for a select list.
 * It accepts a token and a callback function for setting the list of open quotes.
 * The response from the API is then used to update the open quotes. The function returns an object with a 'success' key.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {function} setOpenQuotes - The function to set open quotes state.
 * @returns {Promise<Object>} - An object with 'success' key.
 * @throws Will throw an error if the get open quotes request fails.
 */
export const getOpenQuotesSelectList = async (token, setOpenQuotes) => {
  // Try to send a GET request to the 'serve_open_quotes_select_list/' endpoint of the backend API
  try {
    const response = await axios.get(
      `${BACKEND_URL}quotes/serve_open_quotes_select_list/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // If the request is successful, use the response to update the state of open quotes
    setOpenQuotes(response.data.quotes);
    // Return an object with success set to true
    return { success: true };

    // If any error occurs during the retrieval of the open quotes
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};
