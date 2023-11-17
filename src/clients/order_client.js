import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { uploadImagesToS3 } from "./product_client";
import { showToast } from "../config_and_helpers/helpers";

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
    return Object.values(error.response.data);
  }
};

export const createOrder = async (token, orderData, images) => {
  try {
    const response = await axios.post(`${BACKEND_URL}orders/`, orderData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    let result = { success: true };

    if (images.length) {
      const presignedUrls = response.data.presigned_urls;

      if (response && presignedUrls) {
        uploadImagesToS3(presignedUrls, images).then((r) => {
          if (r && r.uploadStatuses) {
            finalizeOrderImageUploadStatus(token, r.uploadStatuses).then(
              (r) => {
                if (r && !response.success) {
                  result.success = false;
                }
              },
            );
          } else {
            result.success = false;
          }
        });
      } else {
        result.success = false;
      }
    }

    result.toast = () =>
      showToast("Order created successfully!", "success", "top-right");

    return result;
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const updateOrder = async (
  token,
  orderId,
  updatedOrderData,
  newImages,
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

    let result = { success: true };

    if (newImages.length) {
      const presignedUrls = response.data.presigned_urls;

      if (response && presignedUrls) {
        uploadImagesToS3(presignedUrls, newImages).then((r) => {
          if (r && r.uploadStatuses) {
            finalizeOrderImageUploadStatus(token, r.uploadStatuses).then(
              (r) => {
                if (r && !response.success) {
                  result.success = false;
                }
              },
            );
          } else {
            result.success = false;
          }
        });
      } else {
        result.success = false;
      }
    }

    result.toast = () =>
      showToast("Order updated successfully!", "success", "top-right");

    return result;
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const deleteOrder = async (token, orderId) => {
  try {
    await axios.delete(`${BACKEND_URL}orders/${orderId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return {
      success: true,
      toast: () =>
        showToast("Order deleted successfully!", "success", "top-right"),
    };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
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
        setOrders((prevOrders) => [...prevOrders, ...response.data.results]);
      } else {
        setOrders(response.data.results);
      }
      return { success: true, reachedEnd: true };
    }

    if (!nextPage) {
      setOrders(response.data.results);
    } else {
      setOrders((prevOrders) => [...prevOrders, ...response.data.results]);
    }

    return { success: true, nextPage: response.data.next };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const getOrderDetails = async (token, orderId, setOrderDetails) => {
  try {
    const response = await axios.get(`${BACKEND_URL}orders/${orderId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setOrderDetails(response.data);

    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};
