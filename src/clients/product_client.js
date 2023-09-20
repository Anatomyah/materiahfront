import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const createProduct = async (token, productData) => {
  try {
    await axios.post(`${BACKEND_URL}products/`, productData, {
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

export const updateProduct = async (
  token,
  productId,
  productData,
  setProduct,
) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}products/${productId}/`,
      productData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    setProduct(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const deleteProduct = async (token, productId) => {
  try {
    await axios.delete(`${BACKEND_URL}products/${productId}`, {
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
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const getProductSelectList = async (
  token,
  setProductSelectList,
  supplierId,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}products/names/?supplier_id=${supplierId}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setProductSelectList(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};
