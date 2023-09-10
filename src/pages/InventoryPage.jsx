import React, { useContext, useEffect, useState } from "react";
import { getLabInventory } from "../clients/product_client";
import { AppContext } from "../App";
import PaginatorComponent from "../components/PaginatorComponent";
import { useNavigate } from "react-router-dom";
import AddProductModal from "../components/AddProductModal";

const InventoryPage = () => {
  const nav = useNavigate();
  const { token } = useContext(AppContext);
  const [labInventory, setLabInventory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    getLabInventory(token, setLabInventory, setTotalPages, currentPage).then(
      (response) => {
        if (!response) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      },
    );
  }, [currentPage]);

  const goToProductDetails = (product) => {
    nav(`/product-details/${product.id}`, { state: { product } });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!labInventory.length) {
    return "Loading...";
  }
  return (
    <div>
      <div>
        <AddProductModal />
      </div>
      {labInventory.map((product) => (
        <span
          key={product.id}
          className="text-decoration-underline text-primary"
          style={{ cursor: "pointer" }}
          onClick={() => goToProductDetails(product)}
        >
          {product.cat_num}
        </span>
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
