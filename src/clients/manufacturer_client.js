import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const createManufacturer = async (token, manufacturerData) => {
  try {
    await axios.post(`${BACKEND_URL}manufacturers/`, manufacturerData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const updateManufacturer = async (
  token,
  manufacturerId,
  updatedManufacturerData,
  setManufacturer,
) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}manufacturers/${manufacturerId}/`,
      updatedManufacturerData,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setManufacturer(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const deleteManufacturer = async (token, manufacturerId) => {
  try {
    await axios.delete(`${BACKEND_URL}manufacturers/${manufacturerId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const getManufacturers = async (
  token,
  setManufacturers,
  options = {},
) => {
  const { searchInput = "", nextPage = null } = options;

  let url = nextPage ? nextPage : `${BACKEND_URL}manufacturers/?page_num=1`;

  if (searchInput) {
    url += `&search=${searchInput}`;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    const nextCursor = response.data.next;

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

    if (!nextPage) {
      setManufacturers(response.data.results);
    } else {
      setManufacturers((prevManufacturers) => [
        ...prevManufacturers,
        ...response.data.results,
      ]);
    }

    return { success: true, nextPage: response.data.next };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const getManufacturerSelectList = async (token, setManufacturers) => {
  try {
    const response = await axios.get(`${BACKEND_URL}manufacturers/names/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setManufacturers(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const getManufacturerDetails = async (
  token,
  manufacturerId,
  setManufacturerDetails,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}manufacturers/${manufacturerId}/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setManufacturerDetails(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const checkManufacturerName = async (token, name) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}manufacturers/check_name/?name=${name}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    console.log(response.data);
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};
