import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import { getProductDetails } from "../../clients/product_client";
import "./ProductComponentStyle.css";
import InventoryModal from "./InventoryModal";
import ShopModal from "../Shop/ShopModal";
import { Spinner } from "react-bootstrap";

const ProductDetailModal = ({
  productObj,
  productId,
  shopView = false,
  updateProducts,
  showShopModal,
  setShowShopModal,
}) => {
  const { token } = useContext(AppContext);
  const isLoadingRef = useRef(false);
  const [product, setProduct] = useState(productObj);
  const productIdToUse = productObj ? productObj.id : productId;

  const fetchProduct = () => {
    isLoadingRef.current = true;
    getProductDetails(token, productIdToUse, setProduct).then((response) => {
      isLoadingRef.current = false;
    });
  };

  useEffect(() => {
    if (!product && productIdToUse) fetchProduct();
  }, []);

  const handleEdit = () => {
    if (updateProducts) {
      updateProducts();
    }
    fetchProduct();
  };

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
