import { BACKEND_URL } from "../config_and_helpers/config";
import axios from "axios";

export const getOrderNotifications = async (
  token,
  setOrderNotifications,
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

    // If there are more manufacturers to be displayed in next pages return the
    // success status as true and the url for next page of manufacturers
    return { success: true, nextPage: response.data.next };
  } catch (error) {
    // Log and return any errors that occurred during the request
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const getExpiryNotifications = async (
  token,
  setExpiryNotifications,
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

    // If there are more manufacturers to be displayed in next pages return the
    // success status as true and the url for next page of manufacturers
    return { success: true, nextPage: response.data.next };
  } catch (error) {
    // Log and return any errors that occurred during the request
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};
