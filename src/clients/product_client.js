import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const finalizeProductImageUploadStatus = async (
  token,
  uploadStatuses,
) => {
  try {
    await axios.post(
      `${BACKEND_URL}products/update_image_upload_status/`,
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

export const uploadImagesToS3 = async (presignedUrls, files) => {
  if (presignedUrls.length !== files.length) {
    throw new Error(
      "The number of presigned URLs must match the number of files.",
    );
  }

  const uploadStatuses = {};
  const uploadPromises = presignedUrls.map((presignedPostData) => {
    const file = files.find((f) => f.id === presignedPostData.frontend_id);
    const formData = new FormData();

    Object.keys(presignedPostData.fields).forEach((key) => {
      if (key !== "image_id") {
        formData.append(key, presignedPostData.fields[key]);
      }
    });

    formData.append("file", file.file);

    return axios.post(presignedPostData.url, formData).then((response) => {
      uploadStatuses[presignedPostData.image_id] =
        response.status >= 200 && response.status < 300
          ? "completed"
          : "failed";
      return response;
    });
  });

  try {
    const responses = await Promise.all(uploadPromises);

    responses.forEach((response, index) => {
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`File ${index} upload failed: ${response.statusText}`);
      }
    });

    return { uploadStatuses: uploadStatuses };
  } catch (error) {
    console.error("Error uploading files:", error);
    return { error: error.message || "Something went wrong" };
  }
};

export const createProduct = async (token, productData, images) => {
  try {
    const response = await axios.post(`${BACKEND_URL}products/`, productData, {
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
            finalizeProductImageUploadStatus(token, r.uploadStatuses).then(
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

    return result;
  } catch (error) {
    console.error(error.response);
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};

export const updateProduct = async (
  token,
  productId,
  productData,
  newImages,
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

    let result = { success: true };

    if (newImages.length) {
      const presignedUrls = response.data.presigned_urls;

      if (response && presignedUrls) {
        uploadImagesToS3(presignedUrls, newImages).then((r) => {
          if (r && r.uploadStatuses) {
            finalizeProductImageUploadStatus(token, r.uploadStatuses).then(
              (r) => {
                if (r && !r.success) {
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

    return result;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const deleteProduct = async (token, productId) => {
  try {
    await axios.delete(`${BACKEND_URL}products/${productId}/`, {
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

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    const nextCursor = response.data.next;

    if (!nextCursor) {
      if (nextPage) {
        setProducts((prevProducts) => [
          ...prevProducts,
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
    const response = await axios.get(`${BACKEND_URL}products/${productId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    setProductDetails(response.data);

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

export const checkCatNum = async (token, value) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}products/check_cat_num/?value=${value}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    console.log(response.data);
    return response.data.unique;
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};
