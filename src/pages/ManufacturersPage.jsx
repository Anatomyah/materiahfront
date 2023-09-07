import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../components/PaginatorComponent";
import { AppContext } from "../App";
import { getManufacturers } from "../client/manufacturer_client";

const ManufacturersPage = () => {
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!manufacturers) {
    return "Loading...";
  }

  return (
    <div>
      {manufacturers.map((manufacturer) => (
        <li key={manufacturer.id}>{manufacturer.name}</li>
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
