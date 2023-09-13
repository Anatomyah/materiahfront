import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

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
    alert(error);
    return error.response ? error.response.data.detail : "Something went wrong";
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
    setTotalPages(response.data.total_pages);
    return { success: true };
  } catch (error) {
    return error.response ? error.response.data.detail : "Something went wrong";
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
    return error.response ? error.response.data.detail : "Something went wrong";
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
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};
