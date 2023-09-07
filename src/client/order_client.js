import axios from "axios";
import { BACKEND_URL } from "./config";

export const getOrders = async (token, setOrders, setTotalPages, page = 1) => {
  try {
    const response = await axios.get(`${BACKEND_URL}orders/?page_num=${page}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    setOrders(response.data.results);
    setTotalPages(response.data.total_pages);
  } catch (error) {
    return error;
  }
};
