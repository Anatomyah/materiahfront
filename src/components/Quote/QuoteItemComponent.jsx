import React, { useEffect, useState } from "react";
import DropdownSelect from "../Generic/DropdownSelect";
import { Form, FormControl, Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * Component: QuoteItemComponent
 * Description: Renders a form segment for managing individual quote items, including product selection, quantity, and price.
 * Props:
 *   - productList: Array of product options for the dropdown.
 *   - disabledOptions: Array of options to be disabled in the dropdown.
 *   - onItemChange: Function to handle item changes (debounced).
 *   - index: Index of the item in the quote.
 *   - item: The current item object.
 *   - handleItemDelete: Function to handle deletion of the item.
 *   - showRemoveButton: Boolean to control the visibility of the remove item button.
 *   - formik: Formik object for form management.
 */
const QuoteItemComponent = ({
  productList,
  disabledOptions,
  editMode,
  onItemChange,
  index,
  item,
  handleItemDelete,
  showRemoveButton,
  formik,
}) => {
  // State to manage the typing timeout for debounced input handling
  const [typingTimeout, setTypingTimeout] = useState(null);
  // Find the product in the productList based on the item value
  const foundProduct = item ? productList.find((p) => p.value === item) : null;
  // State to manage the selected product
  const [product, setProduct] = useState(foundProduct);

  // Reset the product state when productList changes
  useEffect(() => {
    if (!editMode) setProduct(null);
  }, [productList]);

  /**
   * Function: handleDelayedChange
   * Description: Handles delayed changes for input fields to reduce the frequency of state updates during rapid typing.
   * Parameters:
   *   - name: The name of the form field being changed.
   *   - value: The new value of the form field.
   */
  const handleDelayedChange = (name, value) => {
    // Clear existing timeout to reset the debounce timer
    if (typingTimeout) clearTimeout(typingTimeout);

    // Set a new timeout to delay the invocation of onItemChange
    const newTimeout = setTimeout(() => {
      onItemChange(index, name, value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  /**
   * Function: handleProductChange
   * Description: Handles changes to the product dropdown.
   * Parameters:
   *   - newValue: The new value selected in the product dropdown.
   */
  const handleProductChange = (newValue) => {
    setProduct(newValue);
    onItemChange(index, "product", newValue.value);
  };

  // Form field names incorporating the item index for unique identification
  const quantityFieldName = `items[${index}].quantity`;
  const priceFieldName = `items[${index}].price`;

  // Render a spinner if productList is not available
  if (!productList) {
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
      {/* Product selection dropdown */}
      {editMode ? (
        <h5>{product.label}</h5>
      ) : (
        <DropdownSelect
          optionsList={productList}
          label="Select a product"
          selectedValue={product}
          setSelectedValue={handleProductChange}
          disabledOptions={disabledOptions}
        />
      )}
      {/* Form group for item quantity */}
      <Form.Group controlId={`itemQuantity${index}`} className="field-margin">
        <Form.Label>Item Quantity</Form.Label>
        <FormControl
          disabled={editMode}
          name={quantityFieldName}
          type="text"
          value={formik.values?.items[index]?.quantity || ""}
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
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.items?.[index]?.quantity}
        </Form.Control.Feedback>
      </Form.Group>
      {/* Form group for item price */}
      <Form.Group controlId={`itemPrice${index}`} className="field-margin">
        <Form.Label>Item Price</Form.Label>
        <FormControl
          disabled={editMode}
          name={priceFieldName}
          type="text"
          value={formik.values?.items[index]?.price || ""}
          onChange={(event) => {
            formik.handleChange(event);
            const { value } = event.target;
            handleDelayedChange("price", value);
          }}
          onBlur={formik.handleBlur}
          onFocus={() => formik.setFieldTouched(priceFieldName, true)}
          isValid={
            formik.touched.items?.[index]?.price &&
            !formik.errors.items?.[index]?.price
          }
          isInvalid={
            !!formik.errors.items?.[index]?.price &&
            formik.touched.items?.[index]?.price
          }
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.items?.[index]?.price}
        </Form.Control.Feedback>
      </Form.Group>
      {/* Conditionally render the remove item button */}
      {!showRemoveButton && (
        <Button
          variant="outline-danger"
          onClick={(e) => {
            handleItemDelete(e, index);
          }}
        >
          <DeleteIcon />
        </Button>
      )}
    </div>
  );
};
export default QuoteItemComponent;
