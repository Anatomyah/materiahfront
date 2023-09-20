import React, { useState } from "react";
import DropdownSelect from "../Generic/DropdownSelect";

const QuoteItemComponent = ({ productList, onItemChange, index }) => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const handleProductChange = (newValue) => {
    setProduct(newValue);
    onItemChange(index, "product", newValue.value);
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
    onItemChange(index, "quantity", value);
  };

  const handlePriceChange = (value) => {
    setPrice(value);
    onItemChange(index, "price", value);
  };

  return (
    <div>
      <DropdownSelect
        optionsList={productList}
        label="Product"
        selectedValue={product}
        setSelectedValue={handleProductChange}
      />
      <input
        type="number"
        placeholder="Quantity"
        id="item_quantity"
        onChange={(e) => handleQuantityChange(e.target.value)}
        value={quantity}
      />
      <input
        type="number"
        placeholder="Single unit price, before VAT"
        id="item_price"
        onChange={(e) => handlePriceChange(e.target.value)}
        value={price}
      />
    </div>
  );
};
export default QuoteItemComponent;
