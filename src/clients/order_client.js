import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const finalizeOrderImageUploadStatus = async (token, uploadStatuses) => {
  try {
    await axios.post(
      `${BACKEND_URL}orders/update_image_upload_status/`,
      uploadStatuses,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const createOrder = async (token, orderData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}orders/`, orderData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    let result = { success: true };

    if (response.data.presigned_urls) {
      result.preSignedUrls = response.data.presigned_urls;
    }

    return result;
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

    let result = { success: true };

    if (response.data.presigned_urls) {
      result.preSignedUrls = response.data.presigned_urls;
    }

    return result;
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

export const getOrders = async (token, setOrders, options = {}) => {
  const { searchInput = "", nextPage = null } = options;

  let url = nextPage ? nextPage : `${BACKEND_URL}orders/?page_num=1`;

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
        setOrders((prevManufacturers) => [
          ...prevManufacturers,
          ...response.data.results,
        ]);
      } else {
        setOrders(response.data.results);
      }
      return { success: true, reachedEnd: true };
    }

    if (!nextPage) {
      setOrders(response.data.results);
    } else {
      setOrders((prevManufacturers) => [
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

export const getOrderDetails = async (token, orderId, setOrderDetails) => {
  try {
    const response = await axios.get(`${BACKEND_URL}orders/${orderId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setOrderDetails(response.data);

    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};
