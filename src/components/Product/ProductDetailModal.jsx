import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import { getProductDetails } from "../../clients/product_client";
import "./ProductComponentStyle.css";
import InventoryModal from "./InventoryModal";
import ShopModal from "../Shop/ShopModal";
import { Spinner } from "react-bootstrap";
import { OrderContext } from "../../pages/Order/OrdersPage";

/**
 * Represents a modal component to display detailed information about a product.
 *
 * This component can be configured to display product details in different contexts,
 * such as a shopping view or an inventory management view. It fetches product details
 * if not provided and handles updating of product information.
 *
 * @component
 * @param {Object} props
 * @param {Object} [props.productObj=null] - The product object to display.
 * @param {string} [props.productId=null] - The ID of the product to fetch details for.
 * @param {boolean} [props.shopView=false] - Flag to determine if the modal is used in a shop view.
 * @param {Function} [props.updateProducts] - Callback function to update products list.
 * @param {boolean} [props.showShopModal] - Flag to control the visibility of the shop modal.
 * @param {Function} [props.setShowShopModal] - Function to set the visibility state of the shop modal.
 * @returns The ProductDetailModal component.
 *
 * Usage:
 * ```jsx
 * <ProductDetailModal
 *    productObj={product}
 *    productId="12345"
 *    shopView={true}
 *    updateProducts={updateHandler}
 *    showShopModal={showModal}
 *    setShowShopModal={setShowModal}
 * />
 * ```
 */
const ProductDetailModal = ({
  productObj,
  productId,
  shopView = false,
  updateProducts,
  showShopModal,
  setShowShopModal,
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
          />
        ))}
    </div>
  );
};

export default ProductDetailModal;
