import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AppContext, CartAppContext } from "../../App";
import { deleteProduct, getProductDetails } from "../../clients/product_client";
import DeleteButton from "../Generic/DeleteButton";
import EditProductModal from "./EditProductModal";
import { ButtonGroup } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const ProductDetailComponent = () => {
  const { token } = useContext(AppContext);
  const { cart, setCart } = useContext(CartAppContext);
  const { id } = useParams();
  const { state } = useLocation();
  const shopView = state ? state.shopView : false;
  const [productAmount, setProductAmount] = useState("");
  const [product, setProduct] = useState(state ? state.product : null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (!product) {
      getProductDetails(token, id, setProduct).then((response) => {
        if (response && !response.success) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }, [id]);

  const handleMinusClick = () => {
    if (productAmount <= 1) {
      setProductAmount("");
    } else {
      setProductAmount((prevState) => prevState - 1);
    }
  };

  const handlePlusClick = () => {
    if (productAmount === 0) {
      setProductAmount(1);
    } else {
      setProductAmount((prevState) => Number(prevState) + 1);
    }
  };

  const handleInputChange = (value) => {
    if (value < 1) {
      setProductAmount("");
    } else {
      setProductAmount(value);
    }
  };

  const handleAddToCart = () => {
    const itemExists = cart.some((item) => item.cat_num === product.cat_num);

    if (itemExists) {
      setCart((prevCart) => {
        return prevCart.map((item) =>
          item.cat_num === product.cat_num
            ? {
                ...item,
                quantity: Number(item.quantity) + Number(productAmount),
              }
            : item,
        );
      });
    } else {
      const newItem = {
        product: product.id,
        cat_num: product.cat_num,
        name: product.name,
        image: product.images.length > 0 ? product.images[0].image : null,
        supplier: product.supplier,
        quantity: Number(productAmount),
      };
      setCart((prevCart) => {
        return [...prevCart, newItem];
      });
    }
  };

  if (!product) {
    return "Product details not available";
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <div>
        {product.images.map((image) => (
          <a
            href={image.image_url}
            key={image.id}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              key={image.id}
              src={image.image_url}
              alt={`product-${product.cat_num}-image-${image.id}`}
              width="200"
            />
          </a>
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
      {!shopView && (
        <>
          <DeleteButton
            objectType="product"
            objectName={product.name}
            objectId={product.id}
            deleteFetchFunc={deleteProduct}
            returnLocation="inventory"
          />
          {product && (
            <EditProductModal
              productObj={product}
              onSuccessfulUpdate={setProduct}
            />
          )}
        </>
      )}
      {shopView && (
        <>
          <ButtonGroup
            disableElevation
            variant="contained"
            aria-label="Disabled elevation buttons"
          >
            <Button onClick={handleMinusClick}>-</Button>
            <TextField
              value={productAmount}
              onChange={(e) => handleInputChange(e.target.value)}
              id="outlined-number"
              label="Amount"
              InputLabelProps={{
                shrink: true,
              }}
              onKeyPress={(e) => {
                if (e.key.match(/[^0-9]/)) {
                  e.preventDefault();
                }
              }}
            />
            <Button onClick={handlePlusClick}>+</Button>
          </ButtonGroup>
          <Button
            variant="outlined"
            onClick={handleAddToCart}
            disabled={productAmount <= 0}
          >
            Add to Cart
          </Button>
        </>
      )}
      {errorMessages.length > 0 && (
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
