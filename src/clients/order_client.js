import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const getOrders = async (token, setOrders, setTotalPages, page = 1) => {
  try {
    const response = await axios.get(`${BACKEND_URL}orders/?page_num=${page}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setOrders(response.data.results);
    console.log(response.data.results);
    setTotalPages(response.data.total_pages);
    return { success: true };
  } catch (error) {
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};

export const getOrderDetails = async (token, orderId, setOrderDetails) => {
  try {
    const response = await axios.get(`${BACKEND_URL}orders/${orderId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setOrderDetails(response.data);
    console.log(response.data);
    return { success: true };
  } catch (error) {
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};
