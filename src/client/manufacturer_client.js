import axios from "axios";
import { BACKEND_URL } from "../config";

export const getManufacturers = async (
  token,
  setManufacturers,
  setTotalPages,
  page = 1,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}manufacturers/?page_num=${page}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setManufacturers(response.data.results);
    setTotalPages(response.data.total_pages);
  } catch (error) {
    return error;
  }
};
