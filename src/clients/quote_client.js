import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";
import { showToast } from "../config_and_helpers/helpers";

export const finalizeQuoteUploadStatus = async (
  token,
  quoteId,
  uploadStatus,
) => {
  try {
    await axios.post(
      `${BACKEND_URL}quotes/update_quote_upload_status/`,
      { quote_id: quoteId, status: uploadStatus },
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

export const uploadQuoteFileToS3 = async (presignedPostData, file) => {
  const formData = new FormData();

  Object.keys(presignedPostData.fields).forEach((key) => {
    formData.append(key, presignedPostData.fields[key]);
  });

  formData.append("file", file);

  try {
    const response = await axios.post(presignedPostData.url, formData);

    if (response.status >= 200 && response.status < 300) {
      return { uploadStatus: "completed" };
    } else {
      return { uploadStatus: "failed" };
    }
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const createQuoteFromCart = async (token, cart_items) => {
  try {
    await axios.post(`${BACKEND_URL}quotes/`, JSON.stringify(cart_items), {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    return {
      success: true,
      toast: () => showToast("Shopping Successful!", "success", "top-right"),
    };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const createQuoteManually = async (token, quoteData, quoteFile) => {
  try {
    const response = await axios.post(`${BACKEND_URL}quotes/`, quoteData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    let result = { success: true };

    if (quoteFile) {
      const presignedUrl = response.data.presigned_url;
      const quoteId = response.data.id;

      if (response && presignedUrl && quoteId) {
        uploadQuoteFileToS3(presignedUrl, quoteFile).then((r) => {
          if (r && r.uploadStatus) {
            finalizeQuoteUploadStatus(token, quoteId, r.uploadStatus).then(
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
      showToast("Quote created successfully!", "success", "top-right");
    return result;
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const updateQuote = async (
  token,
  quoteId,
  updatedQuoteData,
  quoteFile,
) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}quotes/${quoteId}/`,
      updatedQuoteData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    let result = { success: true };

    if (quoteFile) {
      const presignedUrl = response.data.presigned_url;
      const quoteId = response.data.id;

      if (response && presignedUrl && quoteId) {
        uploadQuoteFileToS3(presignedUrl, quoteFile).then((r) => {
          if (r && r.uploadStatus) {
            finalizeQuoteUploadStatus(token, quoteId, r.uploadStatus).then(
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
      showToast("Quote updated successfully!", "success", "top-right");

    return result;
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const deleteQuote = async (token, quoteId) => {
  try {
    await axios.delete(`${BACKEND_URL}quotes/${quoteId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return {
      success: true,
      toast: () =>
        showToast("Quote deleted successfully!", "success", "top-right"),
    };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const getQuotes = async (token, setQuotes, options = {}) => {
  const { searchInput = "", nextPage = null } = options;

  let url = nextPage ? nextPage : `${BACKEND_URL}quotes/?page_num=1`;

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
        setQuotes((prevQuotes) => [...prevQuotes, ...response.data.results]);
      } else {
        setQuotes(response.data.results);
      }
      return { success: true, reachedEnd: true };
    }

    if (!nextPage) {
      setQuotes(response.data.results);
    } else {
      setQuotes((prevQuotes) => [...prevQuotes, ...response.data.results]);
    }

    return { success: true, nextPage: response.data.next };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const getQuoteDetails = async (token, quoteId, setQuoteDetails) => {
  try {
    const response = await axios.get(`${BACKEND_URL}quotes/${quoteId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setQuoteDetails(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};

export const getOpenQuotesSelectList = async (token, setOpenQuotes) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}quotes/serve_open_quotes_select_list/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setOpenQuotes(response.data.quotes);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return Object.values(error.response.data);
  }
};
