import axios from "axios";
import { BACKEND_URL } from "./config";

export const getQuotes = async (token, setQuotes, setTotalPages, page = 1) => {
  try {
    const response = await axios.get(`${BACKEND_URL}quotes/?page_num=${page}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setQuotes(response.data.results);
    setTotalPages(response.data.total_pages);
  } catch (error) {
    return error;
  }
};
