import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { showToast } from "../config_and_helpers/helpers";

/**
 * Send request to finalize product image upload status.
 *
 * This function sends a POST request to the backend, passing along the final upload statuses of product images. This status is used in the backend to decide what to do with the associated `ProductImage` instances.
 *
 * The function uses Axios for sending the HTTP request. It handles both the successful and error response, and returns a corresponding message.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Object} uploadStatuses - The dictionary containing the 'uploadStatus' for each image associated by the 'image_id'.
 * @returns {Promise<Object>} - An object with a boolean 'success' if request is completed; if not, it returns an array of error messages.
 * @throws Will throw an error if the request fails.
 */
export const finalizeProductImageUploadStatus = async (
  token,
  uploadStatuses,
) => {
  try {
    // Send a POST request to the backend with the upload statuses.
    await axios.post(
      `${BACKEND_URL}products/update_image_upload_status/`,
      uploadStatuses,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // If the request is successful, return an object with success status
    return { success: true };
  } catch (error) {
    // If the request fails, log the error messages and return them
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Upload image files to AWS S3.
 *
 * This function handles the process of uploading supplied image files to AWS S3 through predefined, pre-signed URLs.
 * It uses Axios to send POST requests to each pre-signed URL, which are generated by the backend. The details of these URLs are packed in a FormData object along with the corresponding image file.
 * It also creates and manages promises for each upload and handles their resolutions. On successful upload, it updates the status of that upload in an 'uploadStatuses' dictionary.
 * After handling all the uploads, it returns the 'uploadStatuses' object.
 *
 * @async
 * @param {Array} presignedUrls - An array of presigned URL objects. Each object contains the S3 presigned URL details and the associated 'frontend_id'.
 * @param {Array} files - An array of file objects. Each file object contains the file data and associated 'id'.
 * @returns {Promise<Object>} - An object containing 'uploadStatuses' corresponding to each image upload.
 * @throws Will throw an error if the number of presigned URLs does not match the number of files or if any file upload fails.
 */
export const uploadImagesToS3 = async (presignedUrls, files) => {
  // Check if the number of pre-signed URLs matches the number of files
  if (presignedUrls.length !== files.length) {
    throw new Error(
      "The number of presigned URLs must match the number of files.",
    );
  }

  // Initialize the dictionary that will hold the statuses of each upload
  const uploadStatuses = {};

  // Prepare a list of upload jobs - one for each pre-signed URL/file
  const uploadPromises = presignedUrls.map((presignedPostData) => {
    // Find the file to upload by matching the 'id' of the file with the 'frontend_id' in the pre-signed URL data
    const file = files.find((f) => f.id === presignedPostData.frontend_id);

    // Create a new FormData object
    const formData = new FormData();

    // Loop through the pre-signed URL fields and append them to the FormData object
    // Do not append the 'image_id' field as this is not needed in the S3 request
    Object.keys(presignedPostData.fields).forEach((key) => {
      if (key !== "image_id") {
        formData.append(key, presignedPostData.fields[key]);
      }
    });

    // Append the file to the FormData object
    formData.append("file", file.file);

    // Make a POST request to the pre-signed URL, uploading the FormData object
    // On response (successful or not), update the upload status
    return axios.post(presignedPostData.url, formData).then((response) => {
      // If the response status is successful (2xx), set the status to 'completed', otherwise 'failed'
      uploadStatuses[presignedPostData.image_id] =
        response.status >= 200 && response.status < 300
          ? "completed"
          : "failed";
      return response;
    });
  });

  // Execute all the upload jobs and wait until all of them finish
  try {
    const responses = await Promise.all(uploadPromises);

    // If any upload failed, throw an error
    responses.forEach((response, index) => {
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`File ${index} upload failed: ${response.statusText}`);
      }
    });

    // Return the statuses of each upload
    return { uploadStatuses: uploadStatuses };

    // If any catch any error during upload and return it
  } catch (error) {
    console.error("Error uploading files:", error);
    return Object.values(error.response.data);
  }
};

/**
 * Create a new product.
 *
 * This function is used to create a new product by sending a POST request to the backend along with the product data and images.
 * It further uses the 'uploadImagesToS3' and 'finalizeProductImageUploadStatus' functions to handle image file uploads and to update the backend about the final statuses of these uploads.
 * It shows a success toast after successful product creation.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Object} productData - The data of the new product to create.
 * @param {Array} images - The array of image files to upload.
 * @returns {Promise<Object>} - An object containing the boolean 'success' if product creation is successful; if not, it returns an array of error messages.
 * @throws Will throw an error if the product creation request fails.
 */
export const createProduct = async (token, productData, images) => {
  try {
    // Make a POST request to the backend to create a new product
    const response = await axios.post(`${BACKEND_URL}products/`, productData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // Initialize the result object
    let result = { success: true };

    // If there are images to upload
    if (images.length) {
      const presignedUrls = response.data.presigned_urls;

      // If a response and presignedUrls exist
      if (response && presignedUrls) {
        // Upload the images to S3
        uploadImagesToS3(presignedUrls, images).then((r) => {
          // If the upload was successful
          if (r && r.uploadStatuses) {
            // Finalize the image upload status
            finalizeProductImageUploadStatus(token, r.uploadStatuses).then(
              (r) => {
                // If the status finalization was not successful
                if (r && !response.success) {
                  result.success = false;
                }
              },
            );
          } else {
            // If the upload was not successful
            result.success = false;
          }
        });
      } else {
        // If no response or presignedUrls exist
        result.success = false;
      }
    }

    // Display a toast message if the product was created successfully
    result.toast = () =>
      showToast("Product created successfully!", "success", "top-right", 3000);

    return result;

    // Catch any errors during product creation and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Update an existing product.
 *
 * This function is used to update an existing product by sending a PATCH request to the backend along with the updated product data and new images.
 * It uses the 'uploadImagesToS3' and 'finalizeProductImageUploadStatus' functions to handle new image file uploads and to update the backend about the final statuses of these uploads.
 * It shows a success toast after successful product update.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {number} productId - The ID of the product to update.
 * @param {Object} productData - The updated data of the product.
 * @param {Array} newImages - The array of new image files to upload.
 * @returns {Promise<Object>} - An object containing the boolean 'success' if product update is successful; if not, it returns an array of error messages.
 * @throws Will throw an error if the product update request fails.
 */
export const updateProduct = async (
  token,
  productId,
  productData,
  newImages,
) => {
  try {
    // Make a PATCH request to the backend to update the product
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

    // Initialize the result object
    let result = { success: true };

    // If there are new images to upload
    if (newImages.length) {
      const presignedUrls = response.data.presigned_urls;

      // If a response and presignedUrls exist
      if (response && presignedUrls) {
        // Upload the images to S3
        uploadImagesToS3(presignedUrls, newImages).then((r) => {
          // If the upload was successful
          if (r && r.uploadStatuses) {
            // Finalize the image upload status
            finalizeProductImageUploadStatus(token, r.uploadStatuses).then(
              (r) => {
                // If the status finalization was not successful
                if (r && !r.success) {
                  result.success = false;
                }
              },
            );
          } else {
            // If the upload was not successful
            result.success = false;
          }
        });
      } else {
        // If no response or presignedUrls exist
        result.success = false;
      }
    }

    // Display a toast message if the product update was successful
    result.toast = () =>
      showToast("Product updated successfully!", "success", "top-right", 3000);

    return result;

    // Catch any errors during product update and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const deleteProduct = async (token, productId) => {
  try {
    await axios.delete(`${BACKEND_URL}products/${productId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return {
      success: true,
      toast: () =>
        showToast(
          "Product deleted successfully!",
          "success",
          "top-right",
          3000,
        ),
    };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Fetch and set the products.
 *
 * This function gets products details from the backend using either a new request or pagination-based request. Based on the response, it also maintains whether the end of the pagination is reached.
 * It enquires with optional parameters of `searchInput`, `supplierId`, and `supplierCatalogue` to filter the products. Appends these to the URL for managing GET queries.
 * It uses axios to send the GET request to the backend. After successful fetch, it sets the products into the passed 'setProducts' state updater function which is expected to be a React Hook 'useState' updater function.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Function} setProducts - The state updater function to set the products.
 * @param {Object} [options={}] - The optional parameters for the request.
 * @param {string} options.searchInput - The text to search in the products.
 * @param {string} options.supplierId - The supplier ID to filter the products.
 * @param {boolean} options.supplierCatalogue - Whether to filter the products based on the supplier catalogue.
 * @param {string} options.nextPage - The URL of the next page in the pagination series.
 * @returns {Promise<Object>} - An object containing 'success', 'reachedEnd', and 'nextPage'. If fetch is successful, it returns 'success' as true. If end of the pagination is reached, it returns 'reachedEnd' as true. If there are more pages, it returns the 'nextPage' URL. If fetch fails, it returns an array of error messages.
 * @throws Will throw an error if the products fetch request fails.
 */
export const getProducts = async (token, setProducts, options = {}) => {
  const {
    searchInput = "",
    supplierId = "",
    supplierCatalogue = false,
    nextPage = null,
  } = options;

  // Construct the URL with the necessary parameters
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
    // Make a GET request to the backend to fetch the products details
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Check if there is a next page in the pagination
    const nextCursor = response.data.next;

    // If there is no next page
    if (!nextCursor) {
      if (nextPage) {
        // If there is a nextPage passed, append the results to the existing products list
        setProducts((prevProducts) => [
          ...prevProducts,
          ...response.data.results,
        ]);
      } else {
        // Set the received products as the products list
        setProducts(response.data.results);
      }
      return { success: true, reachedEnd: true };
    }

    // If there are more pages
    if (!nextPage) {
      // Set the received products as the products list
      setProducts(response.data.results);
    } else {
      // Append the results to the existing products list
      setProducts((prevProducts) => [
        ...prevProducts,
        ...response.data.results,
      ]);
    }

    // Return the next page and success status
    return { success: true, nextPage: response.data.next };

    // Catch any errors during fetch and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Fetch and set the details of a specific product.
 *
 * This function gets the details of a specific product from the backend using the productId. After successful fetch, it sets the product details into the passed 'setProductDetails' state updater function which is expected to be a React Hook 'useState' updater function.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {number} productId - The ID of the product to get the details.
 * @param {Function} setProductDetails - The state updater function to set the product details.
 * @returns {Promise<Object>} - An object with a boolean 'success' if fetch is successful; if not, it returns an array of error messages.
 * @throws Will throw an error if the product details fetch request fails.
 */
export const getProductDetails = async (
  token,
  productId,
  setProductDetails,
) => {
  try {
    // Make a GET request to the backend to fetch the product details
    const response = await axios.get(`${BACKEND_URL}products/${productId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Set the received product details
    setProductDetails(response.data);

    // Return success status
    return { success: true };

    // Catch any errors during fetch and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Fetch and set the list of products for selection.
 *
 * This function gets the names of products from the backend for providing a selection list. It optionally supports getting the product names associated with a specific supplier. After successful fetch, it sets the names into the passed 'setProductSelectList' state updater function which is expected to be a React Hook 'useState' updater function.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {Function} setProductSelectList - The state updater function to set the list of product names.
 * @param {string} [supplierId] - (Optional) The supplier ID to filter the product selection list.
 * @returns {Promise<Object>} - An object with a boolean 'success' if fetch is successful; if not, it returns an array of error messages.
 * @throws Will throw an error if the product names fetch request fails.
 */
export const getProductSelectList = async (
  token,
  setProductSelectList,
  supplierId,
) => {
  // Construct the URL with the necessary parameters
  let url = `${BACKEND_URL}products/names/`;
  if (supplierId) {
    url += `?supplier_id=${supplierId}`;
  }

  try {
    // Make a GET request to the backend to fetch the product names
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Set the received product names as the selection list
    setProductSelectList(response.data);

    // Return success status
    return { success: true };

    // Catch any errors during fetch and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Check if a product catalog number is unique.
 *
 * This function takes a catalog number as input and checks against the backend whether this number is unique among the products (i.e., no other product has this catalog number).
 * It uses axios to send a GET request to the backend with the catalog number as a query parameter.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {string} value - The product catalog number to check for uniqueness.
 * @returns {Promise<boolean>} - The uniqueness of the product catalog number. If the fetch is not successful, it returns an array of error messages.
 * @throws Will throw an error if the check request fails.
 */
export const checkCatNum = async (token, value) => {
  try {
    // Make a GET request to the backend to check the uniqueness of the catalog number
    const response = await axios.get(
      `${BACKEND_URL}products/check_cat_num/?value=${value}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // Return the uniqueness of the catalog number
    return response.data.unique;

    // Catch any errors during check and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Update the stock level of a specific product.
 *
 * This function is used to update the stock level of a product by sending a POST request to the backend along with the updated stock value and the product ID.
 * It shows a success toast after successful product stock update.
 *
 * @async
 * @param {string} token - The access token for the current user.
 * @param {number} productId - The ID of the product whose stock is to be updated.
 * @param {number} value - The updated stock level.
 * @returns {Promise<Object>} - An object containing the boolean 'success' and a 'toast' function that, when called, shows a success toast. If not successful, it returns an array of error messages.
 * @throws Will throw an error if the product stock update request fails.
 */
export const updateProductStock = async (token, productId, value) => {
  try {
    // Make a POST request to the backend to update the stock level
    await axios.post(
      `${BACKEND_URL}products/update_product_stock/`,
      {
        value: value,
        product_id: productId,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // Return the success status and a function to show success toast
    return {
      success: true,
      toast: () =>
        showToast(
          "Product stock updated successfully!",
          "success",
          "top-right",
          3000,
        ),
    };

    // Catch any errors during update and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Create a stock item in the backend.
 * @async
 * @param {string} token - The token for authentication.
 * @param {string} productId - The ID of the product for which the stock item needs to be created.
 * @param {object|array} data - The data for the stock item. It can be an object for a single stock item or an array of objects for multiple stock items.
 * @param {boolean} multiple - Indicates whether to create multiple stock items or not.
 * @returns {object} - An object with the following properties:
 *     - success {boolean} - Indicates whether the stock item creation was successful or not.
 *     - data {array} - An array of created stock items.
 *     - toast {function} - A function to show success toast message.
 * @throws {array} - An array containing the error messages if there are any errors during stock item creation.
 */
export const createStockItem = async (token, productId, data, multiple) => {
  let URL = `${BACKEND_URL}products/create_stock_item/`;

  if (multiple) URL += "?multiple=True";

  const dataToSend = multiple
    ? { product_id: productId, items: data }
    : {
        product_id: productId,
        batch: data.batch,
        in_use: data.inUse,
        expiry: data.expiry,
        opened_on: data.openedOn,
      };

  try {
    // Make a POST request to the backend to create the stock item
    const response = await axios.post(URL, dataToSend, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Return the success status and a function to show success toast
    return {
      success: true,
      data: response.data["item(s)"],
      toast: () =>
        showToast(
          "Stock item created successfully!",
          "success",
          "top-right",
          3000,
        ),
    };

    // Catch any errors during update and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Updates a stock item.
 *
 * @async
 * @param {string} token - The user token used for authorization.
 * @param {string} itemId - The ID of the stock item to update.
 * @param {object} itemData - The new data for the stock item.
 * @param {string} itemData.batch - The new batch number for the stock item.
 * @param {boolean} itemData.inUse - The new in use status for the stock item.
 * @param {string} itemData.expiry - The new expiry date for the stock item.
 * @returns {Promise} A Promise that resolves to an object containing the success status and a function to show a success toast message in the UI, or rejects with an array of error messages
 *.
 */
export const updateStockItem = async (token, itemId, itemData) => {
  try {
    // Make a PATCH request to the backend to update the stock item
    await axios.patch(
      `${BACKEND_URL}products/update_stock_item/`,
      {
        item_id: itemId,
        batch: itemData.batch,
        in_use: itemData.inUse,
        expiry: itemData.expiry,
        opened_on: itemData.openedOn,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // Return the success status and a function to show success toast
    return {
      success: true,
      toast: () =>
        showToast(
          "Stock item updated successfully!",
          "success",
          "top-right",
          3000,
        ),
    };

    // Catch any errors during update and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Deletes a stock item from the backend.
 *
 * @param {string} token - The authentication token.
 * @param {string} itemId - The ID of the stock item to delete.
 * @returns {Promise<Object>} - A promise that resolves to an object with the following properties:
 *   - success {boolean}: Indicates whether the deletion was successful.
 *   - toast {Function}: A function to show a success toast message.
 * @throws {Error} - If an error occurs during the deletion process.
 */
export const deleteStockItem = async (token, itemId) => {
  try {
    // Make a delete request to the backend to delete a stock item
    await axios.delete(
      `${BACKEND_URL}products/delete_stock_item/?item_id=${itemId}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // Return the success status and a function to show success toast
    return {
      success: true,
      toast: () =>
        showToast(
          "Stock item deleted successfully!",
          "success",
          "top-right",
          3000,
        ),
    };

    // Catch any errors during update and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

/**
 * Update product item stock by making a PATCH request to the backend.
 * @async
 * @param {string} token - The authorization token.
 * @param {number} itemId - The item ID to update.
 * @param {number} updatedStock - The updated stock quantity.
 * @returns {Promise<Object>} - A promise that resolves to an object with the success status and a function to show success toast, or an array of error messages if there are any errors during update.
 */
export const updateProductItemStock = async (token, itemId, updatedStock) => {
  try {
    // Make a PATCH request to the backend to update the stock of the product item
    await axios.patch(
      `${BACKEND_URL}products/update_stock_item_sub_stock/`,
      {
        item_id: itemId,
        updated_stock: updatedStock,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    // Return the success status and a function to show success toast
    return {
      success: true,
      toast: () =>
        showToast(
          "Product item stock updated successfully!",
          "success",
          "top-right",
          3000,
        ),
    };

    // Catch any errors during update and return them
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};
