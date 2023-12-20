import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { showToast } from "../config_and_helpers/helpers";

/**
 * Creates a new manufacturer.
 *
 * Makes a POST request to the backend API to create a new manufacturer. If
 * successful, a success message is displayed to the user. If the request fails,
 * responses are logged and returned.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Object} manufacturerData - An object containing all the data for the new manufacturer.
 * @returns {Promise<Object>} An object containing key "success" with value true if the API call was successful.
 * If the request fails, returns an array containing messages for each error that occurred.
 * @throws {Error} Will throw an error if the request fails.
 */
export const createManufacturer = async (token, manufacturerData) => {
  try {
    // A POST request is being sent to create the new Manufacturer
    // In the request headers, Authorization is using the supplied token
    await axios.post(`${BACKEND_URL}manufacturers/`, manufacturerData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    // If the request is successful, a success message is displayed to the user
    return {
      success: true,
      toast: () =>
        showToast("Manufacturer created successfully!", "success", "top-right"),
    };
  } catch (error) {
    // If the request fails, the error responses are logged and returned
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Updates an existing manufacturer.
 *
 * Sends a PATCH request to the backend API to update an already existing manufacturer with the provided
 * updated details. If successful, then it updates the manufacturer state and shows a success
 * message to the user. If the request fails, responses are logged and returned.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} manufacturerId - The ID of the manufacturer to update.
 * @param {Object} updatedManufacturerData - An object containing the updated manufacturer data.
 * @param {Function} setManufacturer - The function to update the manufacturer in the component's state.
 * @returns {Promise<Object>} An object containing key "success" with value true if the API call was successful.
 * If the request fails, returns an array containing messages for each error that occurred.
 * @throws {Error} Will throw an error if the request fails.
 */
export const updateManufacturer = async (
  token,
  manufacturerId,
  updatedManufacturerData,
  setManufacturer,
) => {
  try {
    // A PATCH request is being sent to update the Manufacturer with the specified ID
    // In request headers, the Authorization is using the supplied token
    const response = await axios.patch(
      `${BACKEND_URL}manufacturers/${manufacturerId}/`,
      updatedManufacturerData,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // If the request is successful, the state of the manufacturer is updated
    setManufacturer(response.data);

    // A success message is displayed to the user
    return {
      success: true,
      toast: () =>
        showToast("Manufacturer updated successfully!", "success", "top-right"),
    };
  } catch (error) {
    // If the request fails, the error responses are logged and returned
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Deletes an existing manufacturer.
 *
 * Sends a DELETE request to the backend API endpoint for the specified manufacturer. If successful,
 * a success message is displayed to the user. If the request fails, responses are logged and returned.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} manufacturerId - The ID of the manufacturer to delete.
 * @returns {Promise<Object>} An object containing key "success" with value true if the API call was successful.
 * If the request fails, returns an array containing messages for each error that occurred.
 * @throws {Error} Will throw an error if the request fails.
 */
export const deleteManufacturer = async (token, manufacturerId) => {
  try {
    // Send a DELETE request to the server to delete the manufacturer with the specified ID
    // Authorization is using the supplied token
    await axios.delete(`${BACKEND_URL}manufacturers/${manufacturerId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // If the request succeeds, a success message is displayed to the user
    return {
      success: true,
      toast: () =>
        showToast("Manufacturer deleted successfully!", "success", "top-right"),
    };
  } catch (error) {
    // If the request fails, the error responses are logged and returned
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Get a list of all manufacturers.
 *
 * Sends a GET request to the backend API to retrieve a list of all manufacturers. The function supports pagination
 * and accepts optional parameters to modify the results such as a search input and a page number for pagination.
 * If successful, it sets the state of the manufacturers in the system and returns an object indicating
 * the success status, the link to the next page of results if they exist, and a flag indicating if the end
 * of the results has been reached.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Function} setManufacturers - The function to update the manufacturers in the component's state.
 * @param {Object} options - An optional object containing searchInput and nextPage parameters.
 * @returns {Promise<Object>} An object with keys "success", "nextPage" (if available), and "reachedEnd". If request fails, returns an array containing messages for each error that occurred.
 * @throws {Error} Will throw an error if the request fails.
 */
export const getManufacturers = async (
  token,
  setManufacturers,
  options = {},
) => {
  const { searchInput = "", nextPage = null } = options;

  // Construct the request URL, initially pointing to first page of manufacturers
  let url = nextPage ? nextPage : `${BACKEND_URL}manufacturers/?page_num=1`;

  // Add a search parameter to the URL if there's any search input given by user
  if (searchInput) {
    url += `&search=${searchInput}`;
  }

  try {
    // Send a GET request to fetch the list of manufacturers
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Extract 'next' object from response data for pagination
    const nextCursor = response.data.next;

    // If there's no nextCursor available, then either it's a nextPage request or end of manufacturers list
    // is reached in both cases update setManufacturers accordingly
    if (!nextCursor) {
      if (nextPage) {
        setManufacturers((prevManufacturers) => [
          ...prevManufacturers,
          ...response.data.results,
        ]);
      } else {
        setManufacturers(response.data.results);
      }
      return { success: true, reachedEnd: true };
    }

    // If it's a nextPage request, then merge old results with new ones
    // Otherwise update all processes with new results
    if (!nextPage) {
      setManufacturers(response.data.results);
    } else {
      setManufacturers((prevManufacturers) => [
        ...prevManufacturers,
        ...response.data.results,
      ]);
    }

    // If there are more manufacturers to be displayed in next pages return the
    // success status as true and the url for next page of manufacturers
    return { success: true, nextPage: response.data.next };
  } catch (error) {
    // Log and return any errors that occurred during the request
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Retrieve a list of manufacturer names for selection.
 *
 * Makes a GET request to the backend API to retrieve a list of manufacturer names that can be used for a select list. On successful response, it updates the list of manufacturers in the component's state. In case of failure, responses are logged and returned.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Function} setManufacturers - The function to update the manufacturer list in the component's state.
 * @returns {Promise<Object>} An object with key "success" with value true if the API call was successful. If it fails, returns an array containing error messages.
 * @throws {Error} Will throw an error if the request fails.
 */
export const getManufacturerSelectList = async (token, setManufacturers) => {
  try {
    // Send a GET request to the backend API to fetch the list of manufacturer names
    const response = await axios.get(`${BACKEND_URL}manufacturers/names/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Update the manufacturers' state with the fetched data
    setManufacturers(response.data.manufacturer_list);

    // Return a success indicator
    return { success: true };
  } catch (error) {
    // If the request fails, log the error messages and return them
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Get the details of a specific manufacturer.
 *
 * Sends a GET request to the backend API to retrieve the details of a specific manufacturer given its ID. If successful, it updates the specified manufacturer details state to reflect the retrieved manufacturer data. If the request fails, responses are logged and returned.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} manufacturerId - The ID of the manufacturer to retrieve details for.
 * @param {Function} setManufacturerDetails - The function to update the manufacturer details in the component state.
 * @returns {Promise<Object>} An object with key "success" with value true if the API call was successful. If it fails, returns an array containing error messages.
 * @throws {Error} Will throw an error if the request fails.
 */
export const getManufacturerDetails = async (
  token,
  manufacturerId,
  setManufacturerDetails,
) => {
  try {
    // Send a GET request to the backend API to fetch the details of the specified manufacturer
    const response = await axios.get(
      `${BACKEND_URL}manufacturers/${manufacturerId}/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    // Update the manufacturer details state with the fetched data
    setManufacturerDetails(response.data);

    // Return a success indicator
    return { success: true };
  } catch (error) {
    // If the request fails, log the error messages and return them
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Check if a manufacturer name exists.
 *
 * Sends a GET request to the backend API to check whether a manufacturer name already exists. If so, returns an object indicating the name is not unique. If the name doesn't exist or the request fails, responses are logged and returned.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} name - The name of the manufacturer to check.
 * @returns {Promise<Object>} An object with key "unique" and value false if the API call was successful and the manufacturer name exists. If it doesn't exist or the request fails, returns an array containing error messages.
 * @throws {Error} Will throw an error if the request fails.
 */
export const checkManufacturerName = async (token, name) => {
  try {
    // Send a GET request to the backend API to check if the manufacturer name exists
    const response = await axios.get(
      `${BACKEND_URL}manufacturers/check_name/?name=${name}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // Process the response according to whether the manufacturer name already exists
    if (response.data.unique) {
      // The manufacturer name does not exist, so return the successful response
      return { success: true };
    } else {
      // The manufacturer name exists, so return an error message
      return { unique: false, error: response.data.message };
    }
  } catch (error) {
    // If the request fails, log the error messages and return them
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};
