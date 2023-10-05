import React, { useContext, useEffect, useState } from "react";
import { getSupplierProducts } from "../../clients/user_client";
import { AppContext } from "../../App";
import PaginatorComponent from "../../components/Generic/PaginatorComponent";
import CreateProductModal from "../../components/Product/CreateProductModal";
import { useNavigate } from "react-router-dom";
const SupplierCataloguePage = () => {
  const nav = useNavigate();
  const { token } = useContext(AppContext);
  const [supplierCatalogue, setSupplierCatalogue] = useState([]);
  const [refreshModal, setRefreshModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSupplierCatalogue = () => {
    getSupplierProducts(
      token,
      setSupplierCatalogue,
      setTotalPages,
      currentPage,
    ).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      } else {
        setRefreshModal(!refreshModal);
      }
    });
  };

  useEffect(() => {
    fetchSupplierCatalogue();
  }, [currentPage]);

  const goToProductDetails = (product) => {
    const state = { product };
    nav(`/product-details/${product.id}`, { state });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!supplierCatalogue) {
    return "loading";
  }
  return (
    <div>
      {supplierCatalogue.length && (
        <>
          {supplierCatalogue.map((product) => (
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
          {!errorMessages && (
            <ul>
              {errorMessages.map((error, id) => (
                <li key={id} className="text-danger fw-bold">
                  {error}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <CreateProductModal
        onSuccessfulCreate={fetchSupplierCatalogue}
        supplierProduct={true}
        refreshModal={refreshModal}
      />

      <PaginatorComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
export default SupplierCataloguePage;
