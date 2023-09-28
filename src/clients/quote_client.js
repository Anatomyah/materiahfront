import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

export const createQuote = async (token, quoteData) => {
  try {
    await axios.post(`${BACKEND_URL}quotes/`, quoteData, {
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

export const updateQuote = async (
  token,
  quoteId,
  updatedQuoteData,
  setQuote,
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
    setQuote(response.data);
    console.log(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};

export const deleteQuote = async (token, quoteId) => {
  try {
    await axios.delete(`${BACKEND_URL}quotes/${quoteId}`, {
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

export const getQuotes = async (token, setQuotes, setTotalPages, page = 1) => {
  try {
    const response = await axios.get(`${BACKEND_URL}quotes/?page_num=${page}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setQuotes(response.data.results);
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

export const getQuoteDetails = async (token, quoteId, setQuoteDetails) => {
  try {
    const response = await axios.get(`${BACKEND_URL}quotes/${quoteId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setQuoteDetails(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
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
    setOpenQuotes(response.data);
    return { success: true };
  } catch (error) {
    console.error(error.response.data);
    return error.response
      ? Object.values(error.response.data).flat()
      : "Something went wrong";
  }
};
