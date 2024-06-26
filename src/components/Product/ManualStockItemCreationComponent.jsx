import React, { useState } from "react";
import { Form, FormControl } from "react-bootstrap";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "react-bootstrap/Button";

/**
 * Represents a component for manual stock item creation.
 *
 * @param {Object} props - The component props.
 * @param {number} props.stockItemIndex - The index of the stock item.
 * @param {Object} props.formik - The Formik instance.
 * @param {Function} props.onItemChange - The callback function for handling stock item changes.
 * @param {Function} props.onItemDelete - The callback function for deleting a stock item.
 * @returns {JSX.Element} The ManualStockItemCreationComponent.
 */
const ManualStockItemCreationComponent = ({
  stockItemIndex,
  formik,
  onItemChange,
  onItemDelete,
}) => {
  // State hook for managing delay in updating form field changes.
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Field names for Formik form fields
  const batchFieldName = `items.[${stockItemIndex}].batch`;
  const expiryFieldName = `items[${stockItemIndex}].expiry`;
  const inUseFieldName = `items[${stockItemIndex}].inUse`;
  const openedOnFieldName = `items[${stockItemIndex}].openedOn`;

  // Function used to update the relevant stock item with a slight delay
  const handleStockItemDelayedChange = (name, value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      onItemChange(stockItemIndex, name, value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  // Function used to update the relevant stock item instantly
  const handleStockItemInstantChange = (name, value) => {
    onItemChange(stockItemIndex, name, value);
  };
  return (
    <div
      className={`${
        stockItemIndex > 0 && "mt-3"
      } border border-secondary-subtle rounded p-3`}
      style={{ backgroundColor: "#efef8f" }}
    >
      <Form.Group
        controlId={`itemBatch${stockItemIndex}`}
        className="field-margin"
      >
        <Form.Label>Batch Number</Form.Label>
        <FormControl
          name={batchFieldName}
          type="text"
          value={formik?.values?.[stockItemIndex]?.batch}
          onChange={(event) => {
            formik.handleChange(event);
            const { value } = event.target;
            handleStockItemDelayedChange("batch", value);
          }}
          onBlur={formik.handleBlur}
          onFocus={() => formik.setFieldTouched(batchFieldName, true)}
          isValid={
            formik?.touched?.items?.[stockItemIndex]?.batch &&
            !formik?.errors?.items?.[stockItemIndex]?.batch &&
            formik.values?.items?.[stockItemIndex]?.batch
          }
          isInvalid={
            formik?.touched?.items?.[stockItemIndex]?.batch &&
            !!formik?.errors?.items?.[stockItemIndex]?.batch
          }
        />
        <Form.Control.Feedback type="invalid">
          {!!formik?.errors?.items &&
            formik?.errors?.items?.length > stockItemIndex &&
            formik?.errors?.items?.[stockItemIndex]?.batch}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Similar structure for the expiry date field */}
      <Form.Group
        controlId={`expiry${stockItemIndex}`}
        className="field-margin"
      >
        <Form.Label>Expiry Date</Form.Label>
        {/* Props for FormControl */}
        <Form.Control
          type="date"
          name={expiryFieldName}
          value={formik?.values?.items?.[stockItemIndex]?.expiry || ""}
          onChange={(e) => {
            const { value } = e.target;
            formik.handleChange(e);
            handleStockItemInstantChange("expiry", value);
          }}
          onFocus={() => formik.setFieldTouched(expiryFieldName, true)}
          onBlur={formik?.handleBlur}
          isValid={
            formik?.touched?.items?.[stockItemIndex]?.expiry &&
            !formik?.errors?.items?.[stockItemIndex]?.expiry &&
            formik?.values?.items?.[stockItemIndex]?.expiry
          }
          isInvalid={
            formik?.touched?.items?.[stockItemIndex]?.expiry &&
            !!formik?.errors?.items?.[stockItemIndex]?.expiry
          }
        />
        <Form.Control.Feedback type="invalid">
          {!!formik?.errors?.items &&
            formik?.errors?.items?.length > stockItemIndex &&
            formik?.errors?.items?.[stockItemIndex]?.expiry}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group
        controlId={`formItemFulfilled${stockItemIndex}`}
        className="field-margin"
      >
        <Form.Check
          name={inUseFieldName}
          type="checkbox"
          label="In Current Use?"
          checked={formik?.values?.items?.[stockItemIndex]?.inUse}
          onChange={(e) => {
            const { checked } = e.target;
            formik.setFieldValue(`items.${stockItemIndex}.inUse`, checked);
            handleStockItemInstantChange("in_use", checked);
          }}
          onBlur={formik.handleBlur}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Opened On</Form.Label>
        {/* Props for FormControl */}
        <Form.Control
          type="date"
          name={openedOnFieldName}
          value={formik?.values?.items?.[stockItemIndex]?.openedOn || ""}
          onChange={(e) => {
            const { value } = e.target;
            formik.handleChange(e);
            handleStockItemInstantChange("opened_on", value);
          }}
          onFocus={() => formik.setFieldTouched(expiryFieldName, true)}
          onBlur={formik.handleBlur}
          isValid={
            formik?.touched?.items?.[stockItemIndex]?.openedOn &&
            !formik?.errors?.items?.[stockItemIndex]?.openedOn &&
            formik?.values?.items?.[stockItemIndex]?.openedOn
          }
          isInvalid={
            formik?.touched?.items?.[stockItemIndex]?.openedOn &&
            !!formik?.errors?.items?.[stockItemIndex]?.openedOn
          }
        />
        <Form.Control.Feedback type="invalid">
          {!!formik?.errors?.items &&
            formik?.errors?.items?.length > stockItemIndex &&
            formik?.errors?.items?.[stockItemIndex]?.openedOn}
        </Form.Control.Feedback>
      </Form.Group>
      <Button
        className="mt-2"
        variant="outline-danger"
        onClick={(e) => {
          onItemDelete(e, stockItemIndex);
        }}
      >
        <DeleteIcon />
      </Button>
    </div>
  );
};
export default ManualStockItemCreationComponent;
