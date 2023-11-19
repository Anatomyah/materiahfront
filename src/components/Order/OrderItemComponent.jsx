import React, { useState } from "react";
import { Form, FormControl, Spinner } from "react-bootstrap";
import "./OrderComponentStyle.css";

const OrderItemComponent = ({
  product,
  item,
  onItemChange,
  index,
  quoteItem,
  formik,
}) => {
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleCheckbox = () => {
    if (formik.values.items[index].itemFulfilled) {
      handleInstantChange("status", "Did not arrive");
    } else {
      handleInstantChange("status", "OK");
    }
    handleDelayedChange(
      "quantity",
      quoteItem ? quoteItem.quantity : item.quote_item.quantity,
    );
    if (formik.values.items[index].otherReasonDetail !== "") {
      handleDelayedChange("issue_detail", "");
    }
  };

  const handleDelayedChange = (name, value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      onItemChange(index, name, value);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  const handleInstantChange = (name, value) => {
    onItemChange(index, name, value);
  };

  const quantityFieldName = `items[${index}].quantity`;
  const batchFieldName = `items[${index}].batch`;
  const expiryDateFieldName = `items[${index}].expiryDate`;
  const itemFulfilledStatus = `items[${index}].itemFulfilled`;
  const selectedReasonFieldName = `items[${index}].selectedReason`;
  const otherReasonDetailFieldName = `items[${index}].otherReasonDetail`;

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
      {formik?.values?.items && formik?.values?.items[index] && (
        <>
          <h3>
            {product.name}, {product.cat_num}
          </h3>
          <Form.Group
            controlId={`itemQuantity${index}`}
            className="field-margin"
          >
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
              disabled={
                formik.values.items[index].selectedReason !== "Different amount"
              }
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.items?.[index]?.quantity}
            </Form.Control.Feedback>
          </Form.Group>
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
          <Form.Group controlId={`expiryDate${index}`} className="field-margin">
            <Form.Label>Expiry Date</Form.Label>
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
          <Form.Group
            controlId={`formItemFulfilled${index}`}
            className="field-margin"
          >
            <Form.Check
              name={itemFulfilledStatus}
              type="checkbox"
              label="Item arrived in full & In good condition"
              checked={formik.values?.items[index]?.itemFulfilled}
              onChange={(event) => {
                const { value } = event.target;
                formik.handleChange(event);
                handleCheckbox(value);
              }}
              onBlur={formik.handleBlur}
            />
          </Form.Group>
          {!formik.values?.items[index]?.itemFulfilled && (
            <>
              <Form.Group
                controlId={`formSelectedReason${index}`}
                className="field-margin"
              >
                <Form.Select
                  name={selectedReasonFieldName}
                  onChange={(event) => {
                    const { value } = event.target;
                    formik.handleChange(event);
                    handleInstantChange("status", value);
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

              {formik.values?.items[index]?.selectedReason === "Other" && (
                <Form.Group controlId={`formOtherReasonDetails${index}`}>
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
