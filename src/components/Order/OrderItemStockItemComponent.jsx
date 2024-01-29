import React, { useState } from "react";
import { Form, FormControl } from "react-bootstrap";

/**
 * Represents a component for displaying and editing stock item details in an order item.
 *
 * @param {Object} props - The component props.
 * @param {number} props.orderItemIndex - The index of the order item.
 * @param {number} props.stockItemIndex - The index of the stock item.
 * @param {function} props.onItemChange - The callback function to handle item changes.
 * @param {Object} props.formik - The Formik object for managing form state.
 * @returns {JSX.Element} - The rendered component.
 */
const OrderItemStockItemComponent = ({
  orderItemIndex,
  stockItemIndex,
  onItemChange,
  formik,
}) => {
  // State hook for managing delay in updating form field changes.
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Field names for Formik form fields
  const batchFieldName = `items[${orderItemIndex}].stock_items[${stockItemIndex}].batch`;
  const expiryFieldName = `items[${orderItemIndex}].stock_items[${stockItemIndex}].expiry`;

  // Handler for stock item inputs that has delay in updating their changes.
  // It clears the previously set timeout and sets a new one.
  const handleStockItemDelayedChange = (name, value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      onItemChange(orderItemIndex, name, value, stockItemIndex);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  // Handler for stock item inputs that should update their changes instantly.
  const handleStockItemInstantChange = (name, value) => {
    onItemChange(orderItemIndex, name, value, stockItemIndex);
  };

  return (
    <div
      className="mt-3 mb-3 border border-secondary-subtle rounded p-3"
      style={{ backgroundColor: "#efef8f" }}
    >
      <h5 className="underline">{`Stock Item #${stockItemIndex + 1}`}</h5>
      {/* Same pattern is followed for batch input field*/}
      <Form.Group
        controlId={`itemBatch${stockItemIndex}`}
        className="field-margin"
      >
        <Form.Label>Batch Number</Form.Label>
        <FormControl
          name={batchFieldName}
          type="text"
          value={
            formik.values?.items[orderItemIndex]?.stock_items[stockItemIndex]
              ?.batch || ""
          }
          onChange={(event) => {
            formik.handleChange(event);
            const { value } = event.target;
            handleStockItemDelayedChange("batch", value);
          }}
          onBlur={formik.handleBlur}
          onFocus={() => formik.setFieldTouched(batchFieldName, true)}
          isValid={
            formik?.touched?.items?.[orderItemIndex]?.stock_items[
              stockItemIndex
            ]?.batch &&
            !formik?.errors?.items?.[orderItemIndex]?.stock_items[
              stockItemIndex
            ]?.batch &&
            formik.values?.items[orderItemIndex]?.stock_items[stockItemIndex]
              ?.batch !== ""
          }
          isInvalid={
            formik?.touched?.items?.[orderItemIndex]?.stock_items[
              stockItemIndex
            ]?.batch &&
            !!formik?.errors?.items?.[orderItemIndex]?.stock_items[
              stockItemIndex
            ]?.batch
          }
        />
        <Form.Control.Feedback type="invalid">
          {!!formik?.errors?.items?.[orderItemIndex]?.stock_items &&
            formik?.errors?.items?.[orderItemIndex]?.stock_items.length >
              stockItemIndex &&
            formik.errors.items?.[orderItemIndex]?.stock_items[stockItemIndex]
              ?.batch}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Similar structure for the expiry date field */}
      <Form.Group
        controlId={`expiry${orderItemIndex}`}
        className="field-margin"
      >
        <Form.Label>Expiry Date</Form.Label>
        {/* Props for FormControl */}
        <Form.Control
          type="date"
          name={expiryFieldName}
          value={
            formik.values?.items[orderItemIndex]?.stock_items[stockItemIndex]
              ?.expiry || ""
          }
          onChange={(e) => {
            const { value } = e.target;
            formik.handleChange(e);
            handleStockItemInstantChange("expiry", value);
          }}
          onFocus={() => formik.setFieldTouched(expiryFieldName, true)}
          onBlur={formik.handleBlur}
          isValid={
            formik?.touched?.items?.[orderItemIndex]?.stock_items[
              stockItemIndex
            ]?.expiry &&
            !formik?.errors?.items?.[orderItemIndex]?.stock_items[
              stockItemIndex
            ]?.expiry &&
            formik.values?.items[orderItemIndex]?.stock_items[stockItemIndex]
              ?.expiry !== ""
          }
          isInvalid={
            formik?.touched?.items?.[orderItemIndex]?.stock_items[
              stockItemIndex
            ]?.expiry &&
            !!formik?.errors?.items?.[orderItemIndex]?.stock_items[
              stockItemIndex
            ]?.expiry
          }
        />
        <Form.Control.Feedback type="invalid">
          {!!formik?.errors?.items?.[orderItemIndex]?.stock_items &&
            formik?.errors?.items?.[orderItemIndex]?.stock_items.length >
              stockItemIndex &&
            formik.errors.items?.[orderItemIndex]?.stock_items[stockItemIndex]
              ?.expiry}
        </Form.Control.Feedback>
      </Form.Group>
    </div>
  );
};
export default OrderItemStockItemComponent;
