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

export const getProducts = async (token, setProducts, options = {}) => {
  const {
    searchInput = "",
    supplierId = "",
    supplierCatalogue = false,
    nextPage = null,
  } = options;

  let url = nextPage ? nextPage : `${BACKEND_URL}products/?page_num=1`;

  if (searchInput) {
    url += `&search=${searchInput}`;
  }
  if (supplierId) {
    url += `&supplier_id=${supplierId}`;
  }
  if (supplierCatalogue) {
    url += `&supplier_catalogue=${supplierCatalogue}`;
  }

  console.log(url);
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
        setProducts((prevManufacturers) => [
          ...prevManufacturers,
          ...response.data.results,
        ]);
      } else {
        setProducts(response.data.results);
      }
      return { success: true, reachedEnd: true };
    }

    if (!nextPage) {
      setProducts(response.data.results);
    } else {
      setProducts((prevProducts) => [
        ...prevProducts,
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
