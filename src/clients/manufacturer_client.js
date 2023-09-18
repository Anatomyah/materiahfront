import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const createManufacturer = async (token, manufacturerData) => {
  try {
    await axios.post(`${BACKEND_URL}manufacturers/`, manufacturerData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    alert(error);
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};

export const getManufacturers = async (
  token,
  setManufacturers,
  setTotalPages,
  page = 1,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}manufacturers/?page_num=${page}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setManufacturers(response.data.results);
    console.log(response.data.results);
    setTotalPages(response.data.total_pages);
    return { success: true };
  } catch (error) {
    return error.response ? error.response.data.detail : "Something went wrong";
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
    console.log(response.data);
    return { success: true };
  } catch (error) {
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};

export const getManufacturerDetails = async (
  token,
  manufacturerId,
  setManufacturerDetails,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}manufacturers/${manufacturerId}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setManufacturerDetails(response.data);
    return { success: true };
  } catch (error) {
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};
