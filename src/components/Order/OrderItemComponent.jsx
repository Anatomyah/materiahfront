import React, { useState } from "react";
import { Form, FormControl, Spinner } from "react-bootstrap";
import "./OrderComponentStyle.css";
import { useFormikContext } from "formik";
import OrderItemStockItemComponent from "./OrderItemStockItemComponent";

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
  orderObjItemStockItems,
  orderObjItemQuantity,
  orderItemStatus,
  onItemChange,
  orderItemIndex,
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
    handleOrderItemInstantChange("status", value);
    updatedItems[orderItemIndex] = {
      ...updatedItems[orderItemIndex],
      selectedReason: value,
    };

    // If 'value' is neither 'Different quantity' nor 'Did not arrive',
    // the item's quantity should be set to match the related quote item quantity
    if (value !== "Different quantity" && value !== "Did not arrive") {
      const quoteItemQuantity = quoteItem
        ? quoteItem.quantity
        : item.quote_item.quantity;

      handleOrderItemInstantChange("quantity", quoteItemQuantity);
      updatedItems[orderItemIndex] = {
        ...updatedItems[orderItemIndex],
        quoteItemQuantity,
      };
    }

    // If the item did not arrive, it's quantity should be set to 0 and the stock items
    // array updated accordingly to []
    if (value === "Did not arrive") {
      const currentStockItems = updatedItems[orderItemIndex].stock_items || [];

      let newStockItemsArray;

      newStockItemsArray = currentStockItems.slice(0, 0);
      handleOrderItemInstantChange("stock_items", newStockItemsArray);
      handleOrderItemInstantChange("quantity", 0);
      updatedItems[orderItemIndex] = {
        ...updatedItems[orderItemIndex],
        quantity: 0,
        stock_items: newStockItemsArray,
      };
    }

    // If the item did arrive but in a different quantity than the related quote, reset the quantity
    // to the quote or order quantity, depending on if creating or update a quote and set the stock items
    // accordingly
    if (value === "Different quantity") {
      const quoteItemQuantity = quoteItem
        ? quoteItem.quantity
        : item.quote_item.quantity;

      const currentStockItems = updatedItems[orderItemIndex].stock_items || [];

      let newStockItemsArray;

      // Re-setting the stock items to the initial stock items related ot this order item, if updating an order
      // else, create an array that extends or subtracts from the current stock items array if creating an order
      if (orderObjItemStockItems) {
        newStockItemsArray = orderObjItemStockItems;
      } else {
        const additionalItems = Array.from(
          {
            length: orderObjItemStockItems
              ? orderObjItemStockItems.length
              : quoteItemQuantity - currentStockItems.length,
          },
          () => ({
            expiry: "",
            batch: "",
          }),
        );

        newStockItemsArray = [...currentStockItems, ...additionalItems];
      }

      // Update the stock items array and quantity in the order items state
      handleOrderItemInstantChange("stock_items", newStockItemsArray);
      handleOrderItemInstantChange("quantity", quoteItemQuantity);

      // Update for the Formik state
      updatedItems[orderItemIndex] = {
        ...updatedItems[orderItemIndex],
        quantity: orderObjItemQuantity
          ? orderObjItemQuantity
          : quoteItem.quantity,
        stock_items: newStockItemsArray,
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
    // Set the quote item quantity
    const quoteItemQuantity = quoteItem
      ? quoteItem.quantity
      : item.quote_item.quantity;

    // When the checkbox is unchecked (i.e., item is unfulfilled), the 'status' and 'selectedReason' are
    // reset to an empty string both for the items separate state and the Formik state
    // 'status' = selectedReason for the Formik field
    // The separate state does not have and itemFulfilled field as the item fulfillment is determined in the backend
    // via the object's status
    if (formik.values.items[orderItemIndex].itemFulfilled) {
      handleOrderItemInstantChange("status", "");
      updatedItems[orderItemIndex] = {
        ...updatedItems[orderItemIndex],
        itemFulfilled: false,
        selectedReason: orderItemStatus || "",
      };

      if (orderObjItemStockItems) {
        handleOrderItemInstantChange("stock_items", orderObjItemStockItems);

        updatedItems[orderItemIndex] = {
          ...updatedItems[orderItemIndex],
          stock_items: orderObjItemStockItems,
        };
      } else {
        handleOrderItemInstantChange("stock_items", item.stock_items);

        updatedItems[orderItemIndex] = {
          ...updatedItems[orderItemIndex],
          stock_items: item.stock_items,
        };
      }
    } else {
      // Otherwise, when the checkbox is checked (i.e., item is fulfilled), the 'status' is set to "OK"
      // , the 'quantity' is restored to its original quote item value and the stock items are reset
      // to their initial stock items array if updating, or based on the existing stock items array if creating
      handleOrderItemInstantChange("status", "OK");

      handleOrderItemInstantChange("quantity", quoteItemQuantity);
      updatedItems[orderItemIndex] = {
        ...updatedItems[orderItemIndex],
        status: "OK",
        quantity: quoteItemQuantity,
        selectedReason: "",
        itemFulfilled: true,
      };

      const currentStockItems = orderObjItemStockItems
        ? orderObjItemStockItems
        : updatedItems[orderItemIndex].stock_items || [];
      const newQuantity = parseInt(quoteItemQuantity, 10);

      let newStockItemsArray;

      if (orderObjItemStockItems) {
        newStockItemsArray = orderObjItemStockItems;
        const stockItemsArrayLength = orderObjItemStockItems.length;

        if (newQuantity > stockItemsArrayLength) {
          // Add new stock items if the new quantity is greater than the current length
          const additionalItems = Array.from(
            { length: newQuantity - stockItemsArrayLength },
            () => ({
              expiry: "",
              batch: "",
            }),
          );
          newStockItemsArray = [...orderObjItemStockItems, ...additionalItems];
        } else {
          if (newQuantity > currentStockItems.length) {
            // Add new stock items if the new quantity is greater than the current length
            const additionalItems = Array.from(
              { length: newQuantity - currentStockItems.length },
              () => ({
                expiry: "",
                batch: "",
              }),
            );

            newStockItemsArray = [...currentStockItems, ...additionalItems];
          } else {
            // Retain only the number of items equal to the new quantity, from the start of the array
            newStockItemsArray = currentStockItems.slice(0, newQuantity);
          }
        }
        handleOrderItemInstantChange("stock_items", newStockItemsArray);

        updatedItems[orderItemIndex] = {
          ...updatedItems[orderItemIndex],
          stock_items: newStockItemsArray,
        };
      }

      // If 'otherReasonDetail' exists, clear it out (in case the selectedReason for the
      // item being unfulfilled is 'Other')
      if (formik.values.items[orderItemIndex].otherReasonDetail !== "") {
        handleOrderItemDelayedChange("issue_detail", "");
        updatedItems[orderItemIndex] = {
          ...updatedItems[orderItemIndex],
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
  // Update the received quantity and echo these changes to the stock items array
  const handleQuantityChange = (value) => {
    const updatedItems = [...formikContext.values.items];
    const currentStockItems = orderObjItemStockItems
      ? orderObjItemStockItems
      : updatedItems[orderItemIndex].stock_items || [];
    const newQuantity = parseInt(value, 10); // Ensure the value is an integer
    const stockItemArrayLength = orderObjItemStockItems
      ? orderObjItemStockItems.length
      : currentStockItems.length;

    let newStockItemsArray;

    // If the new quantity is larger than the current stock items array, add empty array items
    if (newQuantity > stockItemArrayLength) {
      const additionalItems = Array.from(
        { length: newQuantity - currentStockItems.length },
        () => ({
          expiry: "",
          batch: "",
        }),
      );
      newStockItemsArray = [...currentStockItems, ...additionalItems];
      // If the new quantity is equal to the length of the stock items array while updating,
      // reset to the initial stock items array
    } else if (newQuantity === stockItemArrayLength && orderObjItemStockItems) {
      newStockItemsArray = orderObjItemStockItems;
      // If the new quantity is lower, slice it down to match the new quantity
    } else {
      // Retain only the number of items equal to the new quantity, from the start of the array
      newStockItemsArray = currentStockItems.slice(0, newQuantity);
    }

    // Update the items state
    handleOrderItemInstantChange("quantity", value);
    handleOrderItemInstantChange("stock_items", newStockItemsArray);
  };

  // Handler for order item inputs that has delay in updating their changes.
  // It clears the previously set timeout and sets a new one.
  const handleOrderItemDelayedChange = (name, value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      onItemChange(orderItemIndex, name, value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  // Handler for order item inputs that should update their changes instantly.
  const handleOrderItemInstantChange = (name, value) => {
    onItemChange(orderItemIndex, name, value);
  };

  // Field names for Formik form fields
  const quantityFieldName = `items[${orderItemIndex}].quantity`;
  const itemFulfilledStatus = `items[${orderItemIndex}].itemFulfilled`;
  const selectedReasonFieldName = `items[${orderItemIndex}].selectedReason`;
  const otherReasonDetailFieldName = `items[${orderItemIndex}].otherReasonDetail`;

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
    <div
      className="mt-3 mb-3 border border-secondary-subtle rounded p-3"
      style={{ backgroundColor: "#c9e5d6" }}
    >
      {/* Conditional rendering, we check if the 'items' array exists and if the item at current index exists */}
      {formik?.values?.items && formik?.values?.items[orderItemIndex] && (
        <>
          <h3>
            {/* Displaying the product name and catalogue number */}
            {product.name}, {product.cat_num}
          </h3>

          {/* Quantity input field */}
          <Form.Group
            controlId={`itemQuantity${orderItemIndex}`}
            className="field-margin"
          >
            <Form.Label>Received Quantity</Form.Label>
            <FormControl
              // A bunch of prop assignments for FormControl
              // onBlur and onFocus handlers for touch feedback //
              // isValid and isInvalid for displaying validation feedback //
              name={quantityFieldName}
              type="text"
              value={formik.values?.items[orderItemIndex]?.quantity || 0}
              onChange={(event) => {
                formik.handleChange(event);
                const { value } = event.target;
                // Handle the quantity change via the custom function
                handleQuantityChange(value);
              }}
              onBlur={formik.handleBlur}
              onFocus={() => formik.setFieldTouched(quantityFieldName, true)}
              isValid={
                formik.touched.items?.[orderItemIndex]?.quantity &&
                !formik.errors.items?.[orderItemIndex]?.quantity
              }
              isInvalid={
                !!formik.errors.items?.[orderItemIndex]?.quantity &&
                formik.touched.items?.[orderItemIndex]?.quantity
              }
              disabled={
                formik.values.items[orderItemIndex].selectedReason !==
                "Different quantity"
              }
            />

            {/* Adding an invalid feedback component for quantity input field */}
            <Form.Control.Feedback type="invalid">
              {formik?.errors?.items?.[orderItemIndex]?.quantity}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Render the stock item component via mapping over the stock_items array */}
          {item.stock_items.map((stockItem, stockIndex) => (
            <OrderItemStockItemComponent
              key={stockIndex}
              orderItemIndex={orderItemIndex} // Order item index for Formik state management
              stockItemIndex={stockIndex} // stock item index for Formik state management
              onItemChange={onItemChange} // The parent level function in charge of updating the items state
              formik={formik} // Formik props
            />
          ))}

          {/* Check box for whether item has arrived and is in good condition */}
          <Form.Group
            controlId={`formItemFulfilled${orderItemIndex}`}
            className="field-margin"
          >
            <Form.Check
              name={itemFulfilledStatus}
              type="checkbox"
              label="Items arrived in full & In good condition"
              checked={formik.values?.items[orderItemIndex]?.itemFulfilled}
              onChange={handleCheckbox}
              onBlur={formik.handleBlur}
            />
          </Form.Group>

          {/* Depending on whether item has been fulfilled, we show a dropdown of predefined reasons */}
          {!formik.values?.items[orderItemIndex]?.itemFulfilled && (
            <>
              <Form.Group
                controlId={`formSelectedReason${orderItemIndex}`}
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
                  value={
                    formik.values?.items[orderItemIndex]?.selectedReason || ""
                  }
                  onBlur={formik.handleBlur}
                >
                  <option value="" disabled>
                    --Select a Reason--
                  </option>
                  <option value="Did not arrive">Did not arrive</option>
                  <option value="Different quantity">Different quantity</option>
                  <option value="Wrong Item">Wrong Item</option>
                  <option value="Expired or near expiry">
                    Expired or near expiry
                  </option>
                  <option value="Bad condition">Bad condition</option>
                  <option value="Other">Other...</option>
                </Form.Select>
              </Form.Group>

              {/* If 'Other' reason is selected, we provide an additional textarea for the user to specify the issue */}
              {formik.values?.items[orderItemIndex]?.selectedReason ===
                "Other" && (
                <Form.Group
                  controlId={`formOtherReasonDetails${orderItemIndex}`}
                >
                  {/* Props for FormControl */}
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name={otherReasonDetailFieldName}
                    placeholder="Specify the issue"
                    value={
                      formik.values?.items[orderItemIndex]?.otherReasonDetail ||
                      ""
                    }
                    onChange={(event) => {
                      const { value } = event.target;
                      formik.handleChange(event);
                      handleOrderItemDelayedChange("issue_detail", value);
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
