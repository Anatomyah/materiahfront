import React, { useEffect, useState } from "react";
import DropdownSelect from "../Generic/DropdownSelect";
import { Col, Form, FormControl, Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import RequiredAsteriskComponent from "../Generic/RequiredAsteriskComponent";

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
  // State to manage if the product select list was touched
  const [productSelectListTouched, setProductSelectListTouched] = useState(
    !!product,
  );
  // State to manage if to show the discount form field
  const [showDiscountField, setShowDiscountField] = useState(false);

  // useEffect to set the showDiscountField boolean state when editing a quote
  // and when the discount value exists
  useEffect(() => {
    if (formik.values.items?.[index]?.discount) setShowDiscountField(true);
  }, [formik]);

  // Reset the product state when productList changes
  useEffect(() => {
    if (!editMode) setProduct(null);
  }, [productList]);

  // Function to toggle the showDiscountField boolean state
  const toggleShowDiscountField = () => {
    setShowDiscountField((prevState) => !prevState);
  };

  // Function to set the productSelectListTouched state to true
  const handleBlur = () => setProductSelectListTouched(true);

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
  const discountFieldName = `items[${index}].discount`;
  const currencyFieldName = `items[${index}].currency`;

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

      <div className={"d-flex flex-row"}>
        <DropdownSelect
          optionsList={productList}
          label="Select a product"
          selectedValue={product}
          setSelectedValue={handleProductChange}
          disabledOptions={disabledOptions}
          isInvalid={!product && productSelectListTouched}
          touched={productSelectListTouched}
          error="This field is required"
          onBlur={handleBlur}
        />
        <RequiredAsteriskComponent />
      </div>

      {/* Form group for item quantity */}
      <Form.Group
        controlId={`itemQuantity${index}`}
        className="field-margin mt-2"
      >
        <Form.Label>
          Item Quantity <RequiredAsteriskComponent />
        </Form.Label>
        <FormControl
          name={quantityFieldName}
          type="text"
          value={formik.values?.items[index]?.quantity || ""}
          onChange={(event) => {
            formik.handleChange(event);
            const { value } = event.target;
            handleDelayedChange("quantity", value);
          }}
          onBlur={formik.handleBlur}
          isValid={
            !formik.errors.items?.[index]?.quantity &&
            formik.values.items?.[index]?.quantity
          }
          isInvalid={
            (formik.touched.items?.[index]?.quantity &&
              !formik.values.items?.[index]?.quantity) ||
            (formik.errors.items?.[index]?.quantity &&
              formik.errors.items?.[index]?.quantity !==
                "Quantity is required" &&
              formik.values.items?.[index]?.quantity)
          }
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.items?.[index]?.quantity}
        </Form.Control.Feedback>
        <Form.Control.Feedback type="valid">Looks good!</Form.Control.Feedback>
      </Form.Group>
      {/* Form group for item price */}
      <Form.Group controlId={`itemPrice${index}`} className="field-margin">
        <Form.Label>
          Item Price <RequiredAsteriskComponent />
        </Form.Label>
        <FormControl
          name={priceFieldName}
          type="text"
          value={formik.values?.items[index]?.price || ""}
          onChange={(event) => {
            formik.handleChange(event);
            const { value } = event.target;
            handleDelayedChange("price", value);
          }}
          onBlur={formik.handleBlur}
          isValid={
            !formik.errors.items?.[index]?.price &&
            formik.values.items?.[index]?.price
          }
          isInvalid={
            (formik.touched.items?.[index]?.price &&
              !formik.values.items?.[index]?.price) ||
            (formik.errors.items?.[index]?.price &&
              formik.errors.items?.[index]?.price !== "Price is required" &&
              formik.values.items?.[index]?.price)
          }
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.items?.[index]?.price}
        </Form.Control.Feedback>
        <Form.Control.Feedback type="valid">Looks good!</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="d-flex flex-row">
        <Form.Label className="me-3">Discount given?</Form.Label>
        <Form.Switch
          checked={showDiscountField}
          onChange={toggleShowDiscountField}
        />
      </Form.Group>
      {showDiscountField ? (
        <Form.Group controlId="formProductDiscount" className="field-margin">
          <Form.Label>Discount</Form.Label>
          {/* Input for unit quantity with validation feedback. */}
          <Form.Control
            type="text"
            name={discountFieldName}
            value={formik.values?.items?.[index]?.discount || ""}
            onChange={(event) => {
              formik.handleChange(event);
              const { value } = event.target;
              handleDelayedChange("discount", value);
            }}
            onBlur={formik.handleBlur}
            isValid={
              !formik.errors.items?.[index]?.discount &&
              formik.values.items?.[index]?.discount
            }
            isInvalid={
              formik.errors.items?.[index]?.discount &&
              formik.values.items?.[index]?.discount
            }
          />
          {/* Feedback for valid or invalid input. */}
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            {formik.errors?.items?.[index]?.discount}
          </Form.Control.Feedback>
        </Form.Group>
      ) : null}
      <Form.Group
        as={Col}
        md="8"
        controlId="formProductCurrency"
        className="field-margin mt-4"
      >
        <Form.Label>Currency</Form.Label>
        {/* Input for measurement unit with validation feedback. */}
        <Form.Select
          name={currencyFieldName}
          value={formik.values?.items?.[index]?.currency || ""}
          onChange={(event) => {
            formik.handleChange(event);
            const { value } = event.target;
            handleDelayedChange("currency", value);
          }}
          onBlur={formik.handleBlur}
          isValid={formik.values?.items?.[index]?.currency}
          isInvalid={
            formik.touched?.items?.[index]?.currency &&
            !formik.values?.items?.[index]?.currency
          }
        >
          <option value="" disabled>
            -- Select currency --
          </option>
          <option value="NIS">NIS</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </Form.Select>
        {/* Feedback for valid or invalid input. */}
        <Form.Control.Feedback type="valid">Looks good!</Form.Control.Feedback>
        <Form.Control.Feedback type="invalid">
          {formik.errors?.items?.[index]?.currency}
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
