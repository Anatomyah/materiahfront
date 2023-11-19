import React, { useState } from "react";
import DropdownSelect from "../Generic/DropdownSelect";
import { Form, FormControl, Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import DeleteIcon from "@mui/icons-material/Delete";

const QuoteItemComponent = ({
  productList,
  disabledOptions,
  onItemChange,
  index,
  item,
  handleItemDelete,
  showRemoveButton,
  formik,
}) => {
  const [typingTimeout, setTypingTimeout] = useState(null);
  const foundProduct = item ? productList.find((p) => p.value === item) : null;
  const [product, setProduct] = useState(foundProduct);

  const handleDelayedChange = (name, value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      onItemChange(index, name, value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  const handleProductChange = (newValue) => {
    setProduct(newValue);
    onItemChange(index, "product", newValue.value);
  };

  const quantityFieldName = `items[${index}].quantity`;
  const priceFieldName = `items[${index}].price`;

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
      <DropdownSelect
        optionsList={productList}
        label="Product"
        selectedValue={product}
        setSelectedValue={handleProductChange}
        disabledOptions={disabledOptions}
      />
      <Form.Group controlId={`itemQuantity${index}`} className="field-margin">
        <Form.Label>Item Quantity</Form.Label>
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
      <Form.Group controlId={`itemBatch${index}`} className="field-margin">
        <Form.Label>Item Price</Form.Label>
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
