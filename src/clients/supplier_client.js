import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { showToast } from "../config_and_helpers/helpers";

/**
 * Creates a new supplier.
 *
 * This function sends a POST request to the backend API to create a new supplier using the supplierData parameter.
 * If the request is successful, it returns an object with the keys 'success' (true) and 'toast' (a function that shows a success toast).
 * If any step fails, it returns an array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Object} supplierData - The data for the new supplier.
 * @returns {Promise<Object>} - An object with a boolean 'success' attribute and a 'toast' function. For unsuccessful actions, it returns an array of error messages.
 * @throws Will throw an error if the create supplier request fails.
 */
export const createSupplier = async (token, supplierData) => {
  // Try to send a POST request to create a new supplier with the supplied data
  try {
    await axios.post(`${BACKEND_URL}suppliers/`, supplierData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // If the request is successful, return an object with success set to true and a toast function
    // which shows a success toast when the supplier has been created
    return {
      success: true,
      toast: () =>
        showToast(
          "Supplier created successfully!",
          "success",
          "top-right",
          3000,
        ),
    };

    // If any error occurs during the creation of the supplier
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Update a supplier.
 *
 * This function sends a PATCH request to the backend API to update an existing supplier using the supplierId and updatedSupplierData.
 * The function also calls the provided setSupplier callback function to update the supplier state with the updated supplier data.
 * If the request is successful, it returns an object with the keys 'success' (true) and 'toast' (a function that shows a success toast).
 * If any step fails, it returns an array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} supplierId - The ID of the supplier to update.
 * @param {Object} updatedSupplierData - The updated data for the supplier.
 * @param {function} setSupplier - The function to update the supplier state.
 * @returns {Promise<Object>} - An object with a boolean 'success' attribute and a 'toast' function. For unsuccessful actions, it returns an array of error messages.
 * @throws Will throw an error if the update supplier request fails.
 */
export const updateSupplier = async (
  token,
  supplierId,
  updatedSupplierData,
  setSupplier,
) => {
  // Try to send a PATCH request to update a specific supplier using the provided supplierId and updated data
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

    // If the request is successful and the setSupplier callback function is provided
    if (setSupplier) {
      // Use the setSupplier function to update the supplier state with the updated supplier data
      // returned from the PATCH request
      setSupplier(response.data);
    }

    // Return an object with success set to true and a toast function
    // which shows a success toast when the supplier has been updated
    return {
      success: true,
      toast: () =>
        showToast(
          "Supplier updated successfully!",
          "success",
          "top-right",
          3000,
        ),
    };

    // If any error occurs during the update of the supplier
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Deletes a supplier.
 *
 * This function sends a DELETE request to the backend API to delete an existing supplier using the supplierId.
 * If the request is successful, it returns an object with the keys 'success' (true) and 'toast' (a function that shows a success toast).
 * If any step fails, it returns an array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} supplierId - The ID of the supplier to delete.
 * @returns {Promise<Object>} - An object with a boolean 'success' attribute and a 'toast' function. For unsuccessful actions, it returns an array of error messages.
 * @throws Will throw an error if the delete supplier request fails.
 */
export const deleteSupplier = async (token, supplierId) => {
  // Try to send a DELETE request to delete a specific supplier using the provided supplierId
  try {
    await axios.delete(`${BACKEND_URL}suppliers/${supplierId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // If the request is successful, return an object with success set to true and a toast function
    // which shows a success toast when the supplier has been deleted
    return {
      success: true,
      toast: () =>
        showToast(
          "Supplier deleted successfully!",
          "success",
          "top-right",
          3000,
        ),
    };

    // If any error occurs during the deletion of the supplier
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Retrieve a list of suppliers.
 *
 * This function sends a GET request to the backend API to retrieve a list of suppliers. It accepts a token,
 * a callback function for setting suppliers, and an options object as arguments.
 * The options object can include a 'searchInput' for custom queries and a 'nextPage' URL for pagination.
 * The response from the API is then used to update the suppliers.
 * If there is a next page of results, the function returns an object with 'success' (true) and 'nextPage' (the URL of the next page) keys.
 * If there are no more results, it returns an object with 'success' (true) and 'reachedEnd' (true) keys.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {function} setSuppliers - The function to set suppliers state.
 * @param {Object} options - The options object. It can contain 'searchInput' for custom queries and 'nextPage' for pagination.
 * @returns {Promise<Object>} - An object with 'success', 'nextPage' or 'reachedEnd' keys depending on the situation.
 * @throws Will throw an error if the get suppliers request fails.
 */
export const getSuppliers = async (token, setSuppliers, options = {}) => {
  // Default the searchInput and nextPage to empty string and null if not provided in options
  const { searchInput = "", nextPage = null } = options;

  // Set the URL for the suppliers request. If nextPage is provided, use it, otherwise default to the initial page
  let url = nextPage ? nextPage : `${BACKEND_URL}suppliers/?page_num=1`;

  // If searchInput is provided, append it to the query parameters of the URL
  if (searchInput) {
    url += `&search=${searchInput}`;
  }

  // Try to send a GET request to retrieve the list of suppliers
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Extract the next page URL from the response
    const nextCursor = response.data.next;
    // If there is no next page
    if (!nextCursor) {
      if (nextPage) {
        // If it's not the first page, append the new results to the previous ones
        setSuppliers((prevSuppliers) => [
          ...prevSuppliers,
          ...response.data.results,
        ]);
      } else {
        // If it's the first page, replace the old results
        setSuppliers(response.data.results);
      }
      // Indicate success and the end of pagination
      return { success: true, reachedEnd: true };
    }

    // If there is a next page...
    if (!nextPage) {
      // If it's the first page, set the suppliers list to the obtained results
      setSuppliers(response.data.results);
    } else {
      // If it's not the first page, append the new results to the previous ones
      setSuppliers((prevSuppliers) => [
        ...prevSuppliers,
        ...response.data.results,
      ]);
    }

    // Indicate success and return the next page URL
    return { success: true, nextPage: response.data.next };

    // If any error occurs during the retrieval of the suppliers
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Retrieves a list of suppliers for use in a select dropdown.
 *
 * This function sends a GET request to the backend API to retrieve a list of suppliers for displaying them in a dropdown select list.
 * The function uses the provided setSuppliers callback function to update the suppliers state with the returned supplier data.
 * If the request is successful, it returns an object with a 'success' key.
 * If any step fails, it returns an array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {function} setSuppliers - The function to set suppliers state.
 * @returns {Promise<Object>} - An object with 'success' key for successful actions, and array of error messages for unsuccessful ones.
 * @throws Will throw an error if the get supplier select list request fails.
 */
export const getSupplierSelectList = async (token, setSuppliers) => {
  // Try to send a GET request to retrieve the supplier select list
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/serve_supplier_select_list/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // If the request is successful, use the response to update the state of suppliers
    setSuppliers(response.data.suppliers_list);

    // Return an object with success set to true
    return { success: true };

    // If any error occurs during the retrieval of the supplier select list
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Retrieves the details of a specific supplier.
 *
 * This function sends a GET request to the backend API to retrieve the details of a specific supplier using the supplierId.
 * The function uses the provided setSupplierDetails callback function to update the supplier details state with the returned supplier data.
 * If the request is successful, it returns an object with a 'success' key. If any step fails, it returns an array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} supplierId - The ID of the supplier to retrieve details for.
 * @param {function} setSupplierDetails - The function to set supplier details state.
 * @returns {Promise<Object>} - An object with 'success' key for successful actions, and array of error messages for unsuccessful ones.
 * @throws Will throw an error if the get supplier details request fails.
 */
export const getSupplierDetails = async (
  token,
  supplierId,
  setSupplierDetails,
) => {
  // Try to send a GET request to retrieve the supplier details
  try {
    const response = await axios.get(`${BACKEND_URL}suppliers/${supplierId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // If the request is successful, use the response to update the state of supplier details
    setSupplierDetails(response.data);

    // Return an object with success set to true
    return { success: true };

    // If any error occurs during the retrieval of the supplier details
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Checks if a supplier's email is unique.
 *
 * This function sends a GET request to the backend API with a query parameter for the email value to check its uniqueness.
 * If the request is successful, it returns a boolean indicating if the email is unique or not.
 * If any step fails, it returns an array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} value - The email value to check its uniqueness.
 * @returns {Promise<boolean | string[]>} - A boolean indicating if the email is unique or not, or an array of error messages if the request fails.
 * @throws Will throw an error if the check supplier email request fails.
 */
export const checkSupplierEmail = async (token, value) => {
  // Try to send a GET request to check if a supplier's email is unique
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/check_email/?value=${value}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // If the request is successful, return the uniqueness check result
    return response.data.unique;

    // If any error occurs during the email uniqueness check
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Checks if a supplier's phone number is unique.
 *
 * This function sends a GET request to the backend API with query parameters for the phone number's prefix and suffix to check its uniqueness.
 * If the request is successful, it returns a boolean indicating if the phone number is unique or not.
 * If any step fails, it returns an array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} prefix - The prefix of the phone number to check its uniqueness.
 * @param {string} suffix - The suffix of the phone number to check its uniqueness.
 * @returns {Promise<boolean | string[]>} - A boolean indicating if the phone number is unique or not, or an array of error messages if the request fails.
 * @throws Will throw an error if the check supplier phone request fails.
 */
export const checkSupplierPhone = async (token, prefix, suffix) => {
  // Try to send a GET request to check if a supplier's phone number is unique
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/check_phone/?prefix=${prefix}&suffix=${suffix}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // If the request is successful, return the uniqueness check result
    return response.data.unique;

    // If any error occurs during the phone number uniqueness check
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};

/**
 * Checks if a supplier's name is unique.
 *
 * This function sends a GET request to the backend API with a query parameter for the name to check its uniqueness.
 * If the request is successful, it returns a boolean indicating if the name is unique or not.
 * If any step fails, it returns an array of error messages.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} name - The name to check its uniqueness.
 * @returns {Promise<boolean | string[]>} - A boolean indicating if the name is unique or not, or an array of error messages if the request fails.
 * @throws Will throw an error if the check supplier name request fails.
 */
export const checkSupplierName = async (token, name) => {
  // Try to send a GET request to check if a supplier's name is unique
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/check_name/?name=${name}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // If the request is successful, return the uniqueness check result
    return response.data.unique;

    // If any error occurs during the name uniqueness check
  } catch (error) {
    // Log the error details to the console
    console.error(error.response.data);
    // Return the error message as the response data
    return Object.values(error.response.data);
  }
};
