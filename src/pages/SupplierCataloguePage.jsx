import React from "react";
import { useContext, useEffect, useState } from "react";
import { getSupplierProducts } from "../client/user_client";
import { AppContext } from "../App";
import PaginatorComponent from "../components/PaginatorComponent";
const SupplierCataloguePage = () => {
  const { token } = useContext(AppContext);
  const [supplierCatalogue, setSupplierCatalogue] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getSupplierProducts(
      token,
      setSupplierCatalogue,
      setTotalPages,
      currentPage,
    ).then((response) => {
      if (!response) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!supplierCatalogue.length) {
    return "Loading...";
  }
  return (
    <div>
      {supplierCatalogue.map((product) => (
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
export default SupplierCataloguePage;
