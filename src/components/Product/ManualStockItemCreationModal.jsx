import React, { useContext, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Formik } from "formik";
import { Form, Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { PencilFill, Plus } from "react-bootstrap-icons";
import * as yup from "yup";
import ManualStockItemCreationComponent from "./ManualStockItemCreationComponent";
import { createStockItem } from "../../clients/product_client";
import {
  showToast,
  updateProductStockInProductList,
} from "../../config_and_helpers/helpers";
import { AppContext } from "../../App";
import { value } from "lodash/seq";
import { ProductContext } from "../../pages/Product/ProductList";

/**
 * @typedef {import('yup').ObjectSchema} ObjectSchema
 * @typedef {import('yup').StringSchema} StringSchema
 * @typedef {import('yup').DateSchema} DateSchema
 */
const stockItemSchema = yup.object().shape({
  batch: yup.string(),
  expiry: yup.date(),
  openedOn: yup.date(),
});

/**
 * Schema definition for creating stock items manually.
 * @type {import('yup').ObjectSchema}
 */
const createStockItemsManuallySchema = yup.object().shape({
  items: yup.array().of(stockItemSchema),
});

/**
 * Represents a modal component for creating stock items manually.
 *
 * @param {Object} ManualStockItemCreationModal - The data required for the modal component.
 * @param {string} ManualStockItemCreationModal.productName - The name of the product.
 * @param {number} ManualStockItemCreationModal.productId - The ID of the product.
 * @param {string} ManualStockItemCreationModal.productSubStock - The sub stock of the product.
 * @param {function} ManualStockItemCreationModal.onManualCreate - Callback function when creating items manually.
 * @param {function} ManualStockItemCreationModal.onSuccessfulSubmit - Callback function when submission is successful.
 *
 * @returns {JSX.Element} The ManualStockItemCreationModal component.
 */
const ManualStockItemCreationModal = ({
  productName,
  productId,
  productSubStock,
  onManualCreate,
  onSuccessfulSubmit,
}) => {
  // Use the context hook to fetch the token for communication with the server side
  const { token } = useContext(AppContext);
  // Use the context hook to fetch the array of products and it's setting function
  const { products, setProducts } = useContext(ProductContext);

  // State used to manage the isSubmitting status
  const [isSubmitting, setIsSubmitting] = useState(false);
  // state used to manage the showing of the modal
  const [showModal, setShowModal] = useState(false);
  // State used to manage the items to be created
  const [items, setItems] = useState([
    {
      batch: "",
      expiry: "",
      in_use: false,
      opened_on: "",
      item_sub_stock: productSubStock,
    },
  ]);

  // Function used to add an item to the items state array
  const addItem = (e) => {
    e.preventDefault();
    // Appends a new item object to the items array
    setItems([
      ...items,
      {
        batch: "",
        expiry: "",
        in_use: false,
        opened_on: "",
        item_sub_stock: productSubStock,
      },
    ]);
  };

  // Function used to update an item value
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Removes an item from the items array
  const removeItem = (e, index) => {
    e.preventDefault();
    if (items.length === 1) {
      return; // Prevents removing the last item
    }
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Function used to update the product stock for the Inventory Modal
  const updateProductStock = (value) => {
    onManualCreate((prevStockNumber) => prevStockNumber + value);
  };

  // Function to show the modal
  const handleShow = () => setShowModal(true);

  // Function to handle the closing of the modal
  const handleClose = () => {
    setShowModal(false);
    setItems([
      {
        batch: "",
        expiry: "",
        in_use: false,
        opened_on: "",
        item_sub_stock: productSubStock,
      },
    ]);
  };

  // Function used to handle the submission of the item data to the server
  const handleSubmit = () => {
    setIsSubmitting(true);

    // Call the deletion axios function
    createStockItem(token, productId, items, true).then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          // Update the product stock value accordingly
          updateProductStock(value);
          // Update the product array to reflect the changes on the client side
          setProducts(
            updateProductStockInProductList(products, productId, "add"),
          );
          if (onSuccessfulSubmit) onSuccessfulSubmit(response.data);
          response.toast(); // Triggers a success toast message.
          handleClose();
          setIsSubmitting(false); // Resets the submitting state.
        }, 1000);
      } else {
        // Displays an error toast if the submission fails.
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
        setIsSubmitting(false); // Resets the submitting state.
      }
    });
  };

  return (
    <div>
      {/*Button to to activate the modalj*/}
      <Button variant={"success"} onClick={handleShow}>
        <PencilFill /> Manual Creation
      </Button>

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            Manual Stock Items Creation for {productName}
          </Modal.Title>
        </Modal.Header>
        <Formik
          validateOnMount={true}
          validationSchema={createStockItemsManuallySchema}
          onSubmit={handleSubmit}
          initialValues={{}}
        >
          {({
            handleChange,
            handleSubmit,
            values,
            handleBlur,
            touched,
            errors,
            setFieldTouched,
            setFieldValue,
          }) => {
            // Formik provides these props to be utilized in the form fields for handling form state.
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body>
                  {items.length > 0 &&
                    items.map((item, index) => (
                      <ManualStockItemCreationComponent
                        key={index}
                        stockItemIndex={index}
                        formik={{
                          handleChange,
                          values,
                          handleBlur,
                          touched,
                          errors,
                          setFieldTouched,
                          setFieldValue,
                        }}
                        onItemChange={updateItem}
                        onItemDelete={removeItem}
                      />
                    ))}
                  <Button
                    className="field-margin mt-2"
                    onClick={(e) => {
                      addItem(e);
                    }}
                    variant="outline-success"
                  >
                    <Plus size={30} />
                  </Button>
                </Modal.Body>
                <Modal.Footer>
                  {isSubmitting ? (
                    <Button variant="primary" disabled>
                      <Spinner
                        size="sm"
                        as="span"
                        animation="border"
                        role="status"
                        aria-hidden="true"
                      />
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={handleSubmit}>
                      {"Create Items"}
                    </Button>
                  )}

                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </div>
  );
};
export default ManualStockItemCreationModal;
