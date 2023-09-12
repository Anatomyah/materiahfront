import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AppContext } from "../../App";
import { deleteProduct, getProductDetails } from "../../clients/product_client";
import DeleteButton from "../Generic/DeleteButton";
import EditProductModal from "./EditProductModal";

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
        {product.images.map((image) => (
          <img
            key={image.id}
            src={image.image}
            alt={`product-${product.cat_num}-image-${image.id}`}
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
      <DeleteButton
        objectType="product"
        objectName={product.name}
        objectId={product.id}
        deleteFetchFunc={deleteProduct}
      />
      {product && (
        <EditProductModal product={product} setProduct={setProduct} />
      )}
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
ProductDetailComponent.whyDidYouRender = true;
export default ProductDetailComponent;
