import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const createSupplier = async (token, supplierData) => {
  try {
    await axios.post(`${BACKEND_URL}suppliers/`, supplierData, {
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
        },
      },
    );
    if (setSupplier) {
      setSupplier(response.data);
    }
    console.log(response.data);
    return { success: true };
  } catch (error) {
    console.log(error);
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

export const getSuppliers = async (token, setSuppliers, options = {}) => {
  const { searchInput = "", nextPage = null } = options;

  let url = nextPage ? nextPage : `${BACKEND_URL}suppliers/?page_num=1`;

  if (searchInput) {
    url += `&search=${searchInput}`;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    console.log(response.data);

    const nextCursor = response.data.next;

    if (!nextCursor) {
      if (nextPage) {
        setSuppliers((prevManufacturers) => [
          ...prevManufacturers,
          ...response.data.results,
        ]);
      } else {
        setSuppliers(response.data.results);
      }
      return { success: true, reachedEnd: true };
    }

    if (!nextPage) {
      setSuppliers(response.data.results);
    } else {
      setSuppliers((prevManufacturers) => [
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

export const getSupplierSelectList = async (token, setSuppliers) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/serve_supplier_select_list/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
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
