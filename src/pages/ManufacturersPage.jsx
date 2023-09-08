import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../components/PaginatorComponent";
import { AppContext } from "../App";
import { getManufacturers } from "../clients/manufacturer_client";
import { useNavigate } from "react-router-dom";

const ManufacturersPage = () => {
  const nav = useNavigate();
  const { token } = useContext(AppContext);
  const [manufacturers, setManufacturers] = useState();
  const [errorMessages, setErrorMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getManufacturers(token, setManufacturers, setTotalPages, currentPage).then(
      (response) => {
        if (!response) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      },
    );
  }, [currentPage]);

  const goToManufacturerDetails = (manufacturer) => {
    nav(`/manufacturer-details/${manufacturer.id}`, {
      state: { manufacturer },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!manufacturers) {
    return "Loading...";
  }

  return (
    <div>
      {manufacturers.map((manufacturer) => (
        <span
          key={manufacturer.id}
          className="text-decoration-underline text-primary"
          style={{ cursor: "pointer" }}
          onClick={() => goToManufacturerDetails(manufacturer)}
        >
          {manufacturer.name}
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
export default ManufacturersPage;
