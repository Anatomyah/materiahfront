import React, { useState } from "react";
import {
  valueIsPositive,
  valueIsWhole,
} from "../../config_and_helpers/helpers";

const OrderItemComponent = ({
  product,
  item,
  onItemChange,
  index,
  onOtherReasonChange,
}) => {
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [quantity, setQuantity] = useState(item ? item.quantity : "");
  const [price, setPrice] = useState(item ? item.price : "");
  const [batch, setBatch] = useState("");
  const [itemDisabled, setItemDisabled] = useState(true);
  const [selectedReason, setSelectedReason] = useState("");
  const [showOtherReasonTextBox, setShowOtherReasonTextBox] = useState(false);
  const [isPositiveError, setIsPositiveError] = useState(false);
  const [isWholeError, setIsWholeError] = useState(false);

  const handleQuantityChange = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const positiveValidation = valueIsPositive(value);
    const wholeValidation = valueIsWhole(value);
    if (value === "" || (positiveValidation && wholeValidation)) {
      setIsPositiveError(false);
      setIsWholeError(false);
      setQuantity(value);

      const newTimeout = setTimeout(() => {
        onItemChange(index, "quantity", value);
      }, 300);

      setTypingTimeout(newTimeout);
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
    if (typingTimeout) clearTimeout(typingTimeout);

    if (value === "" || valueIsPositive(value)) {
      setIsPositiveError(false);
      setPrice(value);

      const newTimeout = setTimeout(() => {
        onItemChange(index, "price", value);
      }, 300);

      setTypingTimeout(newTimeout);
    } else {
      setIsPositiveError(true);
    }
  };

  const handleBatchChange = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    setBatch(value);

    const newTimeout = setTimeout(() => {
      onItemChange(index, "batch", value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  const handleReasonChange = (value) => {
    setSelectedReason(value);
    onItemChange(index, "status", value);
    if (value === "Other") {
      setShowOtherReasonTextBox(true);
    }
  };

  const handleOtherReasonChange = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      onOtherReasonChange(value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{product.name}</h2>
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
      <input
        type="text"
        placeholder="Batch #"
        id="item_batch"
        onChange={(e) => handleBatchChange(e.target.value)}
        value={batch}
      />
      {isPositiveError && <span>Numbers must be positive</span>}
      {isWholeError && <span>Quantity must be a whole number</span>}
      <label>
        <input
          type="checkbox"
          checked={itemDisabled}
          onChange={() => {
            setItemDisabled((prevState) => !prevState);
          }}
        />
        Item arrived in full
      </label>
      {!itemDisabled && (
        <>
          <select
            onChange={(e) => handleReasonChange(e.target.value)}
            value={selectedReason}
          >
            <option value="" disabled>
              --Select a Reason--
            </option>
            <option value="Did not arrive">Did not arrive</option>
            <option value="Different amount">Different amount</option>
            <option value="Wrong Item">Wrong Item</option>
            <option value="Expired or near expiry">
              Expired or near expiry
            </option>
            <option value="Bad condition">Bad condition</option>
            <option value="Other">Other...</option>
          </select>

          {showOtherReasonTextBox && (
            <textarea
              placeholder="Specify the issue"
              rows="4"
              cols="50"
              onChange={(e) => handleOtherReasonChange(e.target.value)}
            ></textarea>
          )}
        </>
      )}
    </div>
  );
};
export default OrderItemComponent;
