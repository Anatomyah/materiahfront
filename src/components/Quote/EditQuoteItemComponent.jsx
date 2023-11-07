import React, { useState } from "react";

const EditQuoteItemComponent = ({
  onItemChange,
  index,
  item,
  handleItemDelete,
  showRemoveButton,
  itemTitle,
}) => {
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [quantity, setQuantity] = useState(item ? item.quantity : "");
  const [price, setPrice] = useState(item ? item.price : "");

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

  if (!item) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>
        {itemTitle.name} - {itemTitle.cat_num}
      </h1>
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
export default EditQuoteItemComponent;
