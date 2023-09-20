import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const createOrder = async (token, orderData) => {
  try {
    await axios.post(`${BACKEND_URL}orders/`, orderData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
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

export const updateOrder = async (
  token,
  orderId,
  updatedOrderData,
  setOrder,
) => {
  try {
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
    setOrder(response.data);
    console.log(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const deleteOrder = async (token, orderId) => {
  try {
    await axios.delete(`${BACKEND_URL}orders/${orderId}`, {
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
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
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
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};
