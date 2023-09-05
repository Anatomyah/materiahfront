import React from "react";
import { useContext, useEffect, useState } from "react";
import { getSupplierProducts } from "../client";
import { AppContext } from "../App";
const ShowSupplierCatalogue = () => {
  const { token } = useContext(AppContext);
  const [supplierCatalogue, setSupplierCatalogue] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    getSupplierProducts(token, setSupplierCatalogue).then((response) => {
      if (response) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, []);

  if (!supplierCatalogue) {
    return "loading...";
  }
  return (
    <div>
      {supplierCatalogue.map((product) => (
        <li key={product.id}>{product.cat_num}</li>
      ))}
      <ul>
        {errorMessages.map((error, id) => (
          <li key={id} className="text-danger fw-bold">
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ShowSupplierCatalogue;
