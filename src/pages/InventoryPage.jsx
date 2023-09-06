import React, { useContext, useEffect, useState } from "react";
import { getLabInventory } from "../client/product_client";
import { AppContext } from "../App";
import PaginatorComponent from "../components/PaginatorComponent";

const InventoryPage = () => {
  const { token } = useContext(AppContext);
  const [labInventory, setLabInventory] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getLabInventory(token, setLabInventory, setTotalPages, currentPage).then(
      (response) => {
        if (!response) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      },
    );
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!labInventory.length) {
    return "Loading...";
  }
  return (
    <div>
      {labInventory.map((product) => (
        <li key={product.id}>{product.cat_num}</li>
      ))}
      {!errorMessages && (
        <ul>
          {errorMessages.map((error, id) => (
            <li key={id} className="text-danger fw-bold">
              {error}
            </li>
          ))}
        </ul>
      )}

      <PaginatorComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
export default InventoryPage;
