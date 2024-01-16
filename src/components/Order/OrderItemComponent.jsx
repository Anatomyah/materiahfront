import React, { useState } from "react";
import { Form, FormControl, Spinner } from "react-bootstrap";
import "./OrderComponentStyle.css";
import { useFormikContext } from "formik";

/**
 * OrderItemComponent
 *
 * A component that builds a single order item within the order form, complete with necessary fields with validation.
 * These items include fields such as item quantity, batch number, expiry date, item fullfillment and reason for unfullfillment.
 *
 * @param {Object} product - Contains the details of a product.
 * @param {Object} item - Represents a single order item.
 * @param {function} onItemChange - The callback to execute when an item property changes. Updates the data of a specific order item.
 * @param {number} index - The index position of an item in the array.
 * @param {Object} quoteItem - Information about the quote for this order item.
 * @param {Object} formik - The formik object, containing form control methods and values.
 *
 * @component
 */
const OrderItemComponent = ({
  product,
  item,
  onItemChange,
  index,
  quoteItem,
  formik,
}) => {
  // Formik context for enabling Formik functionality in side this child component
  const formikContext = useFormikContext();

  // State hook for managing delay in updating form field changes.
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Function for handling the selected reason change for the item not being fulfilled
  const handleReasonChange = (value) => {
    // Copy current form values for the order items
    const updatedItems = [...formikContext.values.items];

    // Call function to instantly update the items state managed separately in the OrderModal component and for the
    // Formik form management.
    // 'status' for this state is selectedReason for the Formik state.
    handleInstantChange("status", value);
    updatedItems[index] = {
      ...updatedItems[index],
      selectedReason: value,
    };

    // If 'value' is neither 'Different amount' nor 'Did not arrive',
    // the item's quantity should be set to match the related quote item quantity
    if (value !== "Different amount" && value !== "Did not arrive") {
      handleInstantChange(
        "quantity",
        quoteItem ? quoteItem.quantity : item.quote_item.quantity,
      );
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: quoteItem ? quoteItem.quantity : item.quote_item.quantity,
      };
    }

    // If the item did not arrive, it's quantity should be set to 0
    if (value === "Did not arrive") {
      handleInstantChange("quantity", 0);
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: 0,
      };
    }

    // Update formik values with updated items
    formikContext.setValues({
      ...formikContext.values,
      items: updatedItems,
    });
  };

  // Handler for when the item fulfillment checkbox changes.
  const handleCheckbox = () => {
    // Copy current form values for the order items
    const updatedItems = [...formikContext.values.items];

    // When the checkbox is unchecked (i.e., item is unfulfilled), the 'status' and 'selectedReason' are
    // reset to an empty string both for the items separate state and the Formik state
    // 'status' = selectedReason for the Formik field
    // The separate state does not have and itemFulfilled field as the item fulfillment is determined in the backend
    // via the object's status
    if (formik.values.items[index].itemFulfilled) {
      handleInstantChange("status", "");
      updatedItems[index] = {
        ...updatedItems[index],
        itemFulfilled: false,
        selectedReason: "",
      };
    } else {
      // Otherwise, when the checkbox is checked (i.e., item is fulfilled), the 'status' is set to "OK"
      // and the 'quantity' is restored to its original quote item value
      handleInstantChange("status", "OK");
      handleInstantChange(
        "quantity",
        quoteItem ? quoteItem.quantity : item.quote_item.quantity,
      );
      updatedItems[index] = {
        ...updatedItems[index],
        status: "OK",
        quantity: quoteItem ? quoteItem.quantity : item.quote_item.quantity,
        selectedReason: "Did not arrive",
        itemFulfilled: true,
      };

      // If 'otherReasonDetail' exists, clear it out (in case the selectedReason for the
      // item being unfulfilled is 'Other')
      if (formik.values.items[index].otherReasonDetail !== "") {
        handleDelayedChange("issue_detail", "");
        updatedItems[index] = {
          ...updatedItems[index],
          issue_detail: "",
        };
      }
    }

    // Update the Formik state
    formikContext.setValues({
      ...formikContext.values,
      items: updatedItems,
    });
  };

  // Handler for inputs that has delay in updating their changes.
  // It clears the previously set timeout and sets a new one.
  const handleDelayedChange = (name, value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      onItemChange(index, name, value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  // Handler for inputs that should update their changes instantly.
  const handleInstantChange = (name, value) => {
    onItemChange(index, name, value);
  };

  // Field names for Formik form fields
  const quantityFieldName = `items[${index}].quantity`;
  const batchFieldName = `items[${index}].batch`;
  const expiryDateFieldName = `items[${index}].expiryDate`;
  const itemFulfilledStatus = `items[${index}].itemFulfilled`;
  const selectedReasonFieldName = `items[${index}].selectedReason`;
  const otherReasonDetailFieldName = `items[${index}].otherReasonDetail`;

  // Showing a loading spinner if item is undefined or null
  if (!item) {
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
    <div className="mt-3 mb-3 border border-secondary-subtle rounded p-3">
      {/* Conditional rendering, we check if the 'items' array exists and if the item at current index exists */}
      {formik?.values?.items && formik?.values?.items[index] && (
        <>
          <h3>
            {/* Displaying the product name and catalogue number */}
            {product.name}, {product.cat_num}
          </h3>

          {/* Quantity input field */}
          <Form.Group
            controlId={`itemQuantity${index}`}
            className="field-margin"
          >
            <Form.Label>Item Quantity</Form.Label>
            <FormControl
              // A bunch of prop assignments for FormControl
              // onBlur and onFocus handlers for touch feedback //
              // isValid and isInvalid for displaying validation feedback //
              name={quantityFieldName}
              type="text"
              value={formik.values?.items[index]?.quantity || 0}
              onChange={(event) => {
                formik.handleChange(event);
                const { value } = event.target;
                handleDelayedChange("quantity", value);
              }}
              onBlur={formik.handleBlur}
              onFocus={() => formik.setFieldTouched(quantityFieldName, true)}
              isValid={
                formik.touched.items?.[index]?.quantity &&
                !formik.errors.items?.[index]?.quantity
              }
              isInvalid={
                !!formik.errors.items?.[index]?.quantity &&
                formik.touched.items?.[index]?.quantity
              }
              disabled={
                formik.values.items[index].selectedReason !== "Different amount"
              }
            />

            {/* Adding an invalid feedback component for quantity input field */}
            <Form.Control.Feedback type="invalid">
              {formik.errors.items?.[index]?.quantity}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Same pattern is followed for batch input field*/}
          <Form.Group controlId={`itemBatch${index}`} className="field-margin">
            <Form.Label>Batch Number</Form.Label>
            <FormControl
              name={batchFieldName}
              type="text"
              value={formik.values?.items[index]?.batch || ""}
              onChange={(event) => {
                formik.handleChange(event);
                const { value } = event.target;
                handleDelayedChange("batch", value);
              }}
              onBlur={formik.handleBlur}
              onFocus={() => formik.setFieldTouched(batchFieldName, true)}
              isValid={
                formik.touched.items?.[index]?.batch &&
                !formik.errors.items?.[index]?.batch
              }
              isInvalid={
                !!formik.errors.items?.[index]?.batch &&
                formik.touched.items?.[index]?.batch
              }
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.items?.[index]?.batch}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Similar structure for the expiry date field */}
          <Form.Group controlId={`expiryDate${index}`} className="field-margin">
            <Form.Label>Expiry Date</Form.Label>
            {/* Props for FormControl */}
            <Form.Control
              type="date"
              name={expiryDateFieldName}
              value={formik.values?.items[index]?.expiryDate || ""}
              onChange={(e) => {
                const { value } = e.target;
                formik.handleChange(e);
                handleInstantChange("expiry", value);
              }}
              onFocus={() => formik.setFieldTouched(expiryDateFieldName, true)}
              onBlur={formik.handleBlur}
              isInvalid={
                formik.touched.items?.[index]?.expiryDate &&
                !!formik.errors.items?.[index]?.expiryDate
              }
              isValid={
                formik.touched.items?.[index]?.expiryDate &&
                !formik.errors.items?.[index]?.expiryDate
              }
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.items?.[index]?.expiryDate}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Check box for whether item has arrived and is in good condition */}
          <Form.Group
            controlId={`formItemFulfilled${index}`}
            className="field-margin"
          >
            <Form.Check
              name={itemFulfilledStatus}
              type="checkbox"
              label="Item arrived in full & In good condition"
              checked={formik.values?.items[index]?.itemFulfilled}
              onChange={handleCheckbox}
              onBlur={formik.handleBlur}
            />
          </Form.Group>

          {/* Depending on whether item has been fulfilled, we show a dropdown of predefined reasons */}
          {!formik.values?.items[index]?.itemFulfilled && (
            <>
              <Form.Group
                controlId={`formSelectedReason${index}`}
                className="field-margin"
              >
                {/* Providing predefined reasons */}
                {/* User can also enter their own reasons */}
                <Form.Select
                  name={selectedReasonFieldName}
                  onChange={(event) => {
                    const { value } = event.target;
                    handleReasonChange(value);
                  }}
                  value={formik.values?.items[index]?.selectedReason || ""}
                  onBlur={formik.handleBlur}
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
                </Form.Select>
              </Form.Group>

              {/* If 'Other' reason is selected, we provide an additional textarea for the user to specify the issue */}
              {formik.values?.items[index]?.selectedReason === "Other" && (
                <Form.Group controlId={`formOtherReasonDetails${index}`}>
                  {/* Props for FormControl */}
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name={otherReasonDetailFieldName}
                    placeholder="Specify the issue"
                    value={formik.values?.items[index]?.otherReasonDetail || ""}
                    onChange={(event) => {
                      const { value } = event.target;
                      formik.handleChange(event);
                      handleDelayedChange("issue_detail", value);
                    }}
                    onBlur={formik.handleBlur}
                  />
                </Form.Group>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
export default OrderItemComponent;
