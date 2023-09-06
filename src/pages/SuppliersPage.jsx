import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../components/PaginatorComponent";
import { AppContext } from "../App";
import { getSuppliers } from "../client/supplier_client";

const SuppliersPage = () => {
  const { token } = useContext(AppContext);
  const [suppliers, setSuppliers] = useState();
  const [errorMessages, setErrorMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getSuppliers(token, setSuppliers, setTotalPages, currentPage).then(
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

  if (!suppliers) {
    return "Loading...";
  }

  return (
    <div>
      {suppliers.map((supplier) => (
        <li key={supplier.id}>{supplier.name}</li>
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
export default SuppliersPage;
