import React, { useContext, useEffect, useState } from "react";
import { getLabInventory } from "../../clients/product_client";
import { AppContext } from "../../App";
import PaginatorComponent from "../../components/Generic/PaginatorComponent";
import { useNavigate } from "react-router-dom";

const ShopPage = () => {
  const nav = useNavigate();
  const { token } = useContext(AppContext);
  const [labInventory, setLabInventory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMessages, setErrorMessages] = useState([]);

  const fetchProducts = () => {
    getLabInventory(token, setLabInventory, setTotalPages, currentPage).then(
      (response) => {
        if (response && !response.success) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      },
    );
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const goToProductDetails = (product) => {
    nav(`/product-details/${product.id}`, {
      state: { product, shopView: true },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (labInventory.length === 0) {
    return "Loading...";
  }
  return (
    <div>
      <br />
      {labInventory.map((product) => (
        <div
          key={product.id}
          className="text-decoration-underline text-primary"
          style={{ cursor: "pointer" }}
          onClick={() => goToProductDetails(product)}
        >
          {product.images.length > 0 && (
            <img
              src={product.images[0].image}
              alt={`product-${product.cat_num}-image-${product.images[0].id}`}
              width="200"
            />
          )}
          <h1>{product.cat_num}</h1>
          <h1>{product.name}</h1>
        </div>
      ))}
      <br />
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
export default ShopPage;
