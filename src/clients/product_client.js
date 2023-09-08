import axios from "axios";
import { BACKEND_URL } from "./config";

export const getLabInventory = async (
  token,
  setLabInventory,
  setTotalPages,
  page = 1,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}products/?page_num=${page}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setLabInventory(response.data.results);
    setTotalPages(response.data.total_pages);
  } catch (error) {
    return error;
  }
};

export const getProductDetails = async (
  token,
  productId,
  setProductDetails,
) => {
  try {
    const response = await axios.get(`${BACKEND_URL}products/${productId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setProductDetails(response.data);
    console.log(response.data);
  } catch (error) {
    return error;
  }
};
