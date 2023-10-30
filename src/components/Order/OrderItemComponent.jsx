import React, { useState } from "react";

const OrderItemComponent = ({
  product,
  item,
  onItemChange,
  index,
  quoteItem,
}) => {
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [quantity, setQuantity] = useState(item.quantity ? item.quantity : "");
  const [batch, setBatch] = useState(item.batch ? item.batch : "");
  const [expiryDate, setExpiryDate] = useState(item.expiry ? item.expiry : "");
  const [itemFulfilled, setItemFulfilled] = useState(
    item.status ? item.status === "OK" : true,
  );
  const [selectedReason, setSelectedReason] = useState(
    item.status ? item.status : "",
  );
  const [showOtherReasonTextBox, setShowOtherReasonTextBox] = useState(
    item.status ? item.status === "Other" : false,
  );
  const [otherReasonDetails, setOtherReasonDetails] = useState(
    item.issue_detail ? item.issue_detail : "",
  );

  const handleCheckbox = () => {
    if (itemFulfilled) {
      handleReasonChange("Did not arrive");
    } else {
      handleReasonChange("OK");
    }
    setItemFulfilled((prevState) => !prevState);
    handleQuantityChange(
      quoteItem ? quoteItem.quantity : item.quote_item.quantity,
    );
    setShowOtherReasonTextBox(false);
    if (otherReasonDetails !== "") {
      handleOtherReasonChange("");
    }
  };

  const handleQuantityChange = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    setQuantity(value);

    const newTimeout = setTimeout(() => {
      onItemChange(index, "quantity", value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  const handleBatchChange = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    setBatch(value);

    const newTimeout = setTimeout(() => {
      onItemChange(index, "batch", value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  const handleExpiryDateChange = (value) => {
    setExpiryDate(value);
    onItemChange(index, "expiry", value);
  };

  const handleReasonChange = (value) => {
    setSelectedReason(value);
    onItemChange(index, "status", value);
    if (value === "Other") {
      setShowOtherReasonTextBox(true);
    } else {
      setShowOtherReasonTextBox(false);
    }
  };

  const handleOtherReasonChange = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    setOtherReasonDetails(value);

    const newTimeout = setTimeout(() => {
      onItemChange(index, "issue_detail", value);
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
        type="text"
        placeholder="Quantity"
        id="item_quantity"
        onChange={(e) => handleQuantityChange(e.target.value)}
        value={quantity}
        disabled={selectedReason !== "Different amount"}
        onKeyPress={(e) => {
          if (e.key.match(/[^0-9]/)) {
            e.preventDefault();
          }
        }}
      />
      <input
        type="text"
        placeholder="Batch #"
        id="item_batch"
        onChange={(e) => handleBatchChange(e.target.value)}
        value={batch}
      />
      <input
        type="date"
        placeholder="Select expiry date"
        id="expiry_date"
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) => handleExpiryDateChange(e.target.value)}
        value={expiryDate}
      />
      <label>
        <input
          type="checkbox"
          checked={itemFulfilled}
          onChange={handleCheckbox}
        />
        Item arrived in full & In good condition
      </label>
      {!itemFulfilled && (
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
              value={otherReasonDetails}
            ></textarea>
          )}
        </>
      )}
    </div>
  );
};
export default OrderItemComponent;
