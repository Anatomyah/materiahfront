import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getManufacturerDetails } from "../clients/manufacturer_client";
import { AppContext } from "../App";

const ManufacturerDetailComponent = () => {
  const { token } = useContext(AppContext);
  const { id } = useParams();
  const location = useLocation();
  const [manufacturer, setManufacturer] = useState(
    location.state ? location.state.product : null,
  );
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (!manufacturer) {
      getManufacturerDetails(token, id, setManufacturer).then((response) => {
        if (!response) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }, [id]);

  if (!manufacturer) {
    return "Manufacturer details not available";
  }
  return (
    <div>
      <h1>{manufacturer.name}</h1>
      <a href={manufacturer.website} target="_blank" rel="noopener noreferrer">
        {manufacturer.website}
      </a>
      {manufacturer.products.map((product) => (
        <div key={product.id}>
          <Link to={`/product-details/${product.id}`}>
            {product.name}, {product.cat_num}
          </Link>
        </div>
      ))}
      {manufacturer.suppliers.map((supplier) => (
        <div key={supplier.id}>
          <Link to={`/supplier-details/${supplier.id}`}>{supplier.name}</Link>
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
    </div>
  );
};
export default ManufacturerDetailComponent;
