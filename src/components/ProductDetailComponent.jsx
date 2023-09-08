import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AppContext } from "../App";
import { getProductDetails } from "../clients/product_client";

const ProductDetailComponent = () => {
  const { token } = useContext(AppContext);
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(
    location.state ? location.state.product : null,
  );
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (!product) {
      getProductDetails(token, id, setProduct).then((response) => {
        if (!response) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }, [id]);

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
      <Link to={`/supplier-details/${product.supplier.id}`}>
        {product.supplier.name}
      </Link>
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
