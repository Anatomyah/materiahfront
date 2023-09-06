import axios from "axios";
import { BACKEND_URL } from "../config";

export const getSuppliers = async (
  token,
  setSuppliers,
  setTotalPages,
  page = 1,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}suppliers/?page_num=${page}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setSuppliers(response.data.results);
    setTotalPages(response.data.total_pages);
  } catch (error) {
    return error;
  }
};
