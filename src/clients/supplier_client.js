import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const createSupplier = async (token, supplierData) => {
  try {
    await axios.post(`${BACKEND_URL}suppliers/`, supplierData, {
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

export const updateSupplier = async (
  token,
  supplierId,
  updatedSupplierData,
  setSupplier,
) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}suppliers/${supplierId}/`,
      updatedSupplierData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    setSupplier(response.data);
    console.log(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const deleteSupplier = async (token, supplierId) => {
  try {
    await axios.delete(`${BACKEND_URL}suppliers/${supplierId}`, {
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

export const getSuppliers = async (
  token,
  setSuppliers,
  setTotalPages,
  page = 1,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/?page_num=${page}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setSuppliers(response.data.results);
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

export const getSupplierSelectList = async (token, setSuppliers) => {
  try {
    const response = await axios.get(`${BACKEND_URL}suppliers/names/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setSuppliers(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const getSupplierDetails = async (
  token,
  supplierId,
  setSupplierDetails,
) => {
  try {
    const response = await axios.get(`${BACKEND_URL}suppliers/${supplierId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setSupplierDetails(response.data);
    console.log(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};
