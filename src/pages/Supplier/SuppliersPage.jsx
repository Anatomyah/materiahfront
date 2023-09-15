import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../../components/Generic/PaginatorComponent";
import { AppContext } from "../../App";
import { getSuppliers } from "../../clients/supplier_client";
import { useNavigate } from "react-router-dom";
import AddSupplierModal from "../../components/Supplier/AddSupplierModal";

const SuppliersPage = () => {
  const nav = useNavigate();
  const { token } = useContext(AppContext);
  const [suppliers, setSuppliers] = useState();
  const [errorMessages, setErrorMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getSuppliers(token, setSuppliers, setTotalPages, currentPage).then(
      (response) => {
        if (response && !response.success) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      },
    );
  }, [currentPage]);

  const goToSupplierDetails = (supplier) => {
    nav(`/supplier-details/${supplier.id}`, {
      state: { supplier },
    });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!suppliers) {
    return "Loading...";
  }

  return (
    <div>
      <div>
        <AddSupplierModal />
      </div>
      {suppliers.map((supplier) => (
        <span
          key={supplier.id}
          className="text-decoration-underline text-primary"
          style={{ cursor: "pointer" }}
          onClick={() => goToSupplierDetails(supplier)}
        >
          {supplier.name}
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
export default SuppliersPage;
