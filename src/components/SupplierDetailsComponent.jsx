import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AppContext } from "../App";
import { getSupplierDetails } from "../clients/supplier_client";

const SupplierDetailComponent = () => {
  const { token } = useContext(AppContext);
  const { id } = useParams();
  const location = useLocation();
  const [supplier, setSupplier] = useState(
    location.state ? location.state.product : null,
  );
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (!supplier) {
      getSupplierDetails(token, id, setSupplier).then((response) => {
        if (!response) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }, [id]);

  if (!supplier) {
    return "Supplier details not available";
  }
  return (
    <div>
      <h1>{supplier.name}</h1>
      <a href={supplier.website} target="_blank" rel="noopener noreferrer">
        {supplier.website}
      </a>
      <h1>{supplier.email}</h1>
      <h1>
        {supplier.phone_prefix}-{supplier.phone_suffix}
      </h1>
      {supplier.supplieruserprofile && (
        <h1>
          {supplier.supplieruserprofile.contact_phone_prefix}-
          {supplier.supplieruserprofile.contact_phone_suffix}
        </h1>
      )}
      {supplier.products.map((product) => (
        <div key={product.id}>
          <Link to={`/product-details/${product.id}`}>
            {product.name}, {product.cat_num}
          </Link>
        </div>
      ))}
      {supplier.manufacturers.map((manufacturer) => (
        <div key={manufacturer.id}>
          <Link to={`/manufacturer-details/${manufacturer.id}`}>
            {manufacturer.name}
          </Link>
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
export default SupplierDetailComponent;
