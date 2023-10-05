import React, { useEffect, useState } from "react";
import DropdownSelect from "../Generic/DropdownSelect";

const CreateQuoteItemComponent = ({
  productList,
  onItemChange,
  index,
  item,
  itemIds,
  handleItemDelete,
  showRemoveButton,
}) => {
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [product, setProduct] = useState(
    item ? productList.find((p) => p.value === item.product) : null,
  );
  const [quantity, setQuantity] = useState(item ? item.quantity : "");
  const [price, setPrice] = useState(item ? item.price : "");

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
    setQuantity(value);
    onItemChange(index, "quantity", value);
  };

  const handlePriceChange = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    setPrice(value);

    const newTimeout = setTimeout(() => {
      onItemChange(index, "price", value);
    }, 300);

    setTypingTimeout(newTimeout);
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
        type="text"
        placeholder="Quantity"
        id="item_quantity"
        onChange={(e) => handleQuantityChange(e.target.value)}
        value={quantity}
        onKeyPress={(e) => {
          if (e.key.match(/[^0-9]/)) {
            e.preventDefault();
          }
        }}
      />
      <input
        type="text"
        placeholder="Price (Single unit, pre-VAT)"
        id="item_price"
        onChange={(e) => handlePriceChange(e.target.value)}
        value={price}
        onKeyPress={(e) => {
          if (e.key.match(/[^0-9]/)) {
            e.preventDefault();
          }
        }}
      />
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
export default CreateQuoteItemComponent;
