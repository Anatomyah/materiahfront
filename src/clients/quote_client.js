import axios from "axios";
import { BACKEND_URL } from "../config_and_helpers/config";

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
    return error.response ? error.response.data.detail : "Something went wrong";
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
    console.log(response.data);
    return { success: true };
  } catch (error) {
    return error.response ? error.response.data.detail : "Something went wrong";
  }
};
