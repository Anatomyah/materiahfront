import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import { getProductDetails } from "../../clients/product_client";
import "./ProductComponentStyle.css";
import InventoryModal from "./InventoryModal";
import ShopModal from "../Shop/ShopModal";
import { Spinner } from "react-bootstrap";
import { OrderContext } from "../../pages/Order/OrdersPage";

/**
 * Represents a modal component for displaying product details and allowing user interactions.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.productObj - The product object containing details of the product.
 * @param {string} props.productId - The ID of the product.
 * @param {boolean} [props.shopView=false] - Flag indicating whether the modal is for shopping context.
 * @param {function} [props.updateProducts] - Function to update the list of products.
 * @param {boolean} [props.showShopModal] - Flag indicating whether the shop modal should be shown.
 * @param {function} [props.setShowShopModal] - Function to set the visibility of the shop modal.
 * @param {function} [props.clearSearchValue] - Function to clear the search value.
 * @returns {JSX.Element} The rendered modal component.
 */
const ProductDetailModal = ({
  productObj,
  productId,
  shopView = false,
  updateProducts,
  showShopModal,
  setShowShopModal,
  clearSearchValue,
}) => {
  // Access token from context for authenticated API requests.
  const { token } = useContext(AppContext);
  const { orderUpdated, setOrderUpdated } = useContext(OrderContext);

  // Ref to track the loading state of the component.
  const isLoadingRef = useRef(false);

  // State to store the product details.
  const [product, setProduct] = useState(productObj);

  // Determine the product ID to use based on the provided props.
  const productIdToUse = productObj ? productObj.id : productId;

  // UseEffect to update the state on re-renders
  useEffect(() => {
    setProduct(productObj);
  }, [productObj]);

  // Function to fetch product details from the server.
  const fetchProduct = () => {
    isLoadingRef.current = true;
    getProductDetails(token, productIdToUse, setProduct).then(() => {
      isLoadingRef.current = false;
    });
  };

  // useEffect to fetch product details on component mount if not provided or
  // in case an order is updated to reflect the change in that product's related stock iitems.
  useEffect(() => {
    if ((!product && productIdToUse) || orderUpdated) fetchProduct();
    if (orderUpdated === true) setOrderUpdated(false);
  }, [orderUpdated]);

  // Function to handle product edits and fetch updated data.
  const handleEdit = () => {
    if (updateProducts) updateProducts();
    fetchProduct();
  };

  // Display a spinner while loading product data.
  if (isLoadingRef.current) {
    return (
      <Spinner
        size="lg"
        as="span"
        animation="border"
        role="status"
        aria-hidden="true"
      />
    );
  }

  // Render the appropriate modal based on 'shopView'.
  // ShopModal for shopping context, InventoryModal for inventory management.
  return (
    <div>
      {product &&
        (shopView ? (
          <ShopModal
            product={product}
            handleEdit={handleEdit}
            show={showShopModal}
            setShow={setShowShopModal}
          />
        ) : (
          <InventoryModal
            product={product}
            handleEdit={handleEdit}
            updateProducts={updateProducts}
            clearSearchValue={clearSearchValue}
          />
        ))}
    </div>
  );
};

export default ProductDetailModal;
