import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { showToast } from "../config_and_helpers/helpers";

export const createSupplier = async (token, supplierData) => {
  try {
    await axios.post(`${BACKEND_URL}suppliers/`, supplierData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return {
      success: true,
      toast: () =>
        showToast("Supplier created successfully!", "success", "top-right"),
    };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
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

    return {
      success: true,
      toast: () =>
        showToast("Supplier updated successfully!", "success", "top-right"),
    };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const deleteSupplier = async (token, supplierId) => {
  try {
    await axios.delete(`${BACKEND_URL}suppliers/${supplierId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return {
      success: true,
      toast: () =>
        showToast("Supplier deleted successfully!", "success", "top-right"),
    };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
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

    const nextCursor = response.data.next;

    if (!nextCursor) {
      if (nextPage) {
        setSuppliers((prevSuppliers) => [
          ...prevSuppliers,
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
      setSuppliers((prevSuppliers) => [
        ...prevSuppliers,
        ...response.data.results,
      ]);
    }

    return { success: true, nextPage: response.data.next };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
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
    setSuppliers(response.data.suppliers_list);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const getSupplierDetails = async (
  token,
  supplierId,
  setSupplierDetails,
) => {
  try {
    const response = await axios.get(`${BACKEND_URL}suppliers/${supplierId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setSupplierDetails(response.data);

    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const checkSupplierEmail = async (token, value) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/check_email/?value=${value}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const checkSupplierPhone = async (token, prefix, suffix) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/check_phone/?prefix=${prefix}&suffix=${suffix}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const checkSupplierName = async (token, name) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/check_name/?name=${name}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};
