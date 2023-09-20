import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  deleteManufacturer,
  getManufacturerDetails,
} from "../../clients/manufacturer_client";
import { AppContext } from "../../App";
import EditManufacturerModal from "./EditManufacturerModal";
import DeleteButton from "../Generic/DeleteButton";

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
        if (response && !response.success) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
        console.log("Initial manufacturer data fetched:", manufacturer);
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
      {errorMessages.length > 0 && (
        <ul>
          {errorMessages.map((error, id) => (
            <li key={id} className="text-danger fw-bold">
              {error}
            </li>
          ))}
        </ul>
      )}
      <DeleteButton
        objectType="manufacturer"
        objectName={manufacturer.name}
        objectId={manufacturer.id}
        deleteFetchFunc={deleteManufacturer}
        returnLocation="manufacturers"
      />
      {manufacturer && (
        <EditManufacturerModal
          manufacturerObj={manufacturer}
          onSuccessfulUpdate={setManufacturer}
        />
      )}
    </div>
  );
};
export default ManufacturerDetailComponent;
