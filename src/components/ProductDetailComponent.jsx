import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getManufacturerDetails } from "../client/manufacturer_client";
import { AppContext } from "../App";

const ProductDetailComponent = () => {
  const { token } = useContext(AppContext);
  const location = useLocation();
  const product = location.state.product;
  const [supplierDetails, setSupplierDetails] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);

  if (!product) {
    return "Product details not available";
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <div>
        {product.images.map((image, index) => (
          <img
            key={index}
            src={image.image}
            alt={`product-${index}`}
            width="200"
          />
        ))}
      </div>
      <p>{product.cat_num}</p>
      <p>{product.category}</p>
      <Link to={`/manufacturer-details/${product.manufacturer.id}`}>
        {product.manufacturer.name}
      </Link>
      <p>{product.price}</p>
      <p>{product.stock}</p>
      <p>{product.storage}</p>
      <p>{product.supplier.name}</p>
      <p>{product.unit}</p>
      <p>{product.volume}</p>
      <a href={product.url} target="_blank" rel="noopener noreferrer">
        Product Details
      </a>
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
export default ProductDetailComponent;
