import React, { useEffect, useState } from "react";
import DropdownSelect from "../Generic/DropdownSelect";
import {
  valueIsPositive,
  valueIsWhole,
} from "../../config_and_helpers/helpers";

const QuoteItemComponent = ({
  productList,
  onItemChange,
  index,
  item,
  itemIds,
  handleItemDelete,
  showRemoveButton,
}) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [product, setProduct] = useState(
    item ? productList.find((p) => p.value === item.product) : null,
  );
  const [quantity, setQuantity] = useState(item ? item.quantity : "");
  const [price, setPrice] = useState(item ? item.price : "");
  const [isPositiveError, setIsPositiveError] = useState(false);
  const [isWholeError, setIsWholeError] = useState(false);

  useEffect(() => {
    setProduct(item ? productList.find((p) => p.value === item.product) : null);
    setQuantity(item ? item.quantity : "");
    setPrice(item ? item.price : "");
  }, [item, productList]);

  useEffect(() => {
    const ids = itemIds || [];

    if (productList) {
      const filteredProducts = productList.filter(
        (product) =>
          !ids.includes(product.value) || product.value === item?.product,
      );
      setAvailableProducts(filteredProducts);
    }
  }, [itemIds, productList]);

  const handleProductChange = (newValue) => {
    setProduct(newValue);
    onItemChange(index, "product", newValue.value);
  };

  const handleQuantityChange = (value) => {
    const positiveValidation = valueIsPositive(value);
    const wholeValidation = valueIsWhole(value);
    if (value === "" || (positiveValidation && wholeValidation)) {
      setIsPositiveError(false);
      setIsWholeError(false);
      setQuantity(value);
      onItemChange(index, "quantity", value);
    } else {
      if (!positiveValidation) {
        setIsPositiveError(true);
      }
      if (!wholeValidation) {
        setIsWholeError(true);
      }
    }
  };

  const handlePriceChange = (value) => {
    if (value === "" || valueIsPositive(value)) {
      setIsPositiveError(false);
      setPrice(value);
      onItemChange(index, "price", value);
    } else {
      setIsPositiveError(true);
    }
  };

  if (!productList) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <DropdownSelect
        optionsList={availableProducts}
        label="Product"
        selectedValue={product}
        setSelectedValue={handleProductChange}
      />
      <input
        type="number"
        placeholder="Quantity"
        min="1"
        step="1"
        id="item_quantity"
        onChange={(e) => handleQuantityChange(e.target.value)}
        value={quantity}
      />
      <input
        type="number"
        placeholder="Price (Single unit, pre-VAT)"
        min="1"
        step="1"
        id="item_price"
        onChange={(e) => handlePriceChange(e.target.value)}
        value={price}
      />
      {isPositiveError && <span>Numbers must be positive</span>}
      {isWholeError && <span>Quantity must be a whole number</span>}
      {!showRemoveButton && (
        <button
          onClick={(e) => {
            handleItemDelete(e, index);
          }}
        >
          Remove Item
        </button>
      )}
    </div>
  );
};
export default QuoteItemComponent;
