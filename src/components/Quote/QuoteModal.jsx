import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { getSupplierSelectList } from "../../clients/supplier_client";
import { getProductSelectList } from "../../clients/product_client";
import { createQuoteManually, updateQuote } from "../../clients/quote_client";
import QuoteItemComponent from "./QuoteItemComponent";
import * as yup from "yup";
import { Formik } from "formik";
import { Col, Form, FormControl, Spinner } from "react-bootstrap";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { PencilFill } from "react-bootstrap-icons";

import { showToast } from "../../config_and_helpers/helpers";

// Validation schema for each quote item
const itemSchema = yup.object().shape({
  quantity: yup
    .string()
    .required("Quantity is required")
    .matches(/^\d+$/, "Quantity must be a positive number"),
  price: yup
    .string()
    .required("Price is required")
    .matches(/^\d+(\.\d+)?$/, "Current price must be a valid number"),
});

// Form validation schema creation function
const createFormSchema = ({ hasQuoteFile }) =>
  yup.object().shape({
    items: yup.array().of(itemSchema),
    supplier: yup.string().required("Supplier is required"),
    quoteFile: yup
      .mixed()
      .when([], () => {
        return hasQuoteFile
          ? yup.mixed()
          : yup.mixed().required("Uploading a quote file is required.");
      })
      .test(
        "fileType",
        "Unsupported file format. Only PDF, Word and Excel format is accepted.",
        (value) => {
          if (!value) return true; // Bypass the test if no file is uploaded
          return value.every((file) => ["application/pdf"].includes(file.type));
        },
      ),
    demandRef: yup
      .string()
      .matches(/^\d+$/, "Demand reference must be a number")
      .required("Demand reference is required"),

    budget: yup
      .string()
      .matches(/^\d+$/, "Budget number must be a number")
      .required("Budget number is required"),
  });

/**
 * Component: QuoteModal
 * @component
 *
 * @description
 * Renders a modal for creating or editing a quote. It includes functionalities for selecting suppliers,
 * products, managing quote items, and uploading a quote file.
 *
 * @prop {Function} onSuccessfulSubmit - Callback function to be called after a successful form submission.
 * @prop {Object} quoteObj - Object containing the quote data for editing. If not provided, the modal is in 'Create' mode.
 * @prop {boolean} homeShowModal - Flag to control modal visibility from the parent component.
 * @prop {Function} setHomeShowModal - Function to update the modal visibility in the parent component.
 *
 */

const QuoteModal = ({
  onSuccessfulSubmit,
  quoteObj,
  homeShowModal,
  setHomeShowModal,
}) => {
  const { token } = useContext(AppContext);
  // State declarations for managing form data and UI state
  const [hasQuoteFile, setHasQuoteFile] = useState(false);
  const formSchema = createFormSchema({
    hasQuoteFile: hasQuoteFile,
  });
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [supplier, setSupplier] = useState(
    quoteObj ? quoteObj.supplier.id : "",
  );
  const [productSelectList, setProductSelectList] = useState([]);
  const [quoteFile, setQuoteFile] = useState(
    quoteObj ? quoteObj.quote_url : "",
  );
  const [items, setItems] = useState(
    quoteObj
      ? () => {
          return quoteObj.items.map((item) => ({
            quote_item_id: item.id,
            product: item.product.id,
            quantity: item.quantity,
            price: item.price || "",
          }));
        }
      : [],
  );
  const [fileChanged, setFileChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(
    homeShowModal ? homeShowModal : false,
  );

  // Effect for initializing or resetting the file-related state
  useEffect(() => {
    if (quoteFile) {
      setHasQuoteFile(true);
    } else {
      setHasQuoteFile(false);
    }
  }, [quoteFile]);

  // Fetch supplier list on component mount
  useEffect(() => {
    getSupplierSelectList(token, setSupplierSelectList);
  }, []);

  // Functions for fetching product list and managing state updates
  const fetchProductSelectList = () => {
    // Fetch product list based on the selected supplier
    getProductSelectList(token, setProductSelectList, supplier);
  };

  // Initialize a default item in the form when the product list is loaded
  useEffect(() => {
    if (productSelectList.length && items.length === 0) {
      setItems([{ product: "", quantity: "", price: "" }]);
    }
  }, [productSelectList]);

  // Fetch product list based on selected supplier
  useEffect(() => {
    if (supplier) {
      fetchProductSelectList();
    }
  }, [supplier]);

  // Closes the modal and resets the form state
  const handleClose = () => {
    // Conditionally update the modal state in the parent component if applicable
    if (setHomeShowModal) setHomeShowModal(false);
    resetModal();
    setShowModal(false);
  };

  // Resets the modal fields to their default values
  const resetModal = () => {
    // Only reset if creating a new quote (i.e., quoteObj is not provided)
    if (!quoteObj) {
      setQuoteFile("");
      setItems([{ product: "", quantity: "", price: "" }]);
    }
  };

  // Handles the logic for showing the modal
  const handleShow = () => {
    setShowModal(true);
  };

  // Handles changes to the file input field
  const handleFileChange = (file) => {
    // Sets the selected file to the quoteFile state
    setQuoteFile(file);
    // Indicates that the file has been changed
    setFileChanged(true);
  };

  // Adds a new quote item to the items array
  const addItem = (e) => {
    e.preventDefault();
    // Appends a new item object to the items array
    setItems([...items, { product: "", quantity: "", price: "" }]);
  };

  // Updates a specific item in the items array
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

  // Handles the submission of the form
  const handleSubmit = (values) => {
    setIsSubmitting(true); // Indicates the start of the submission process

    // Prepares the data for submission
    const quoteData = {
      supplier: values.supplier,
      items: JSON.stringify(items),
      corporate_demand_ref: values.demandRef,
      budget: values.budget,
    };

    if (quoteFile && fileChanged) {
      quoteData.quote_file_type = quoteFile.type;
    }

    // Determines whether to create or update a quote
    const quotePromise = quoteObj
      ? updateQuote(
          token,
          quoteObj.id,
          quoteData,
          fileChanged ? quoteFile : null,
        )
      : createQuoteManually(token, quoteData, quoteFile);

    // Processes the promise returned from quote creation or update
    quotePromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulSubmit();
          response.toast();
          setIsSubmitting(false);
          handleClose();
          if (!quoteObj) {
            resetModal();
          }
        }, 1000);
      } else {
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
        setIsSubmitting(false);
      }
    });
  };

  return (
    <>
      {/* Button to trigger the modal - conditional render based on quoteObj existence */}
      {!homeShowModal && (
        <Button
          variant={quoteObj ? "outline-success" : "success"}
          onClick={handleShow}
        >
          {quoteObj ? <PencilFill /> : "Create Quote"}
        </Button>
      )}

      {/* Main Modal Component */}
      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          {/* Dynamic Modal Title based on whether creating a new quote or editing an existing one */}
          <Modal.Title>{quoteObj ? "Edit" : "Create"} Quote</Modal.Title>
        </Modal.Header>

        {/* Formik Component for form handling */}
        <Formik
          // Formik configurations like initial values, validation schema, etc.
          initialTouched={
            quoteObj
              ? {
                  items: quoteObj.items.map(() => ({
                    quantity: true,
                    price: true,
                  })),
                  supplier: true,
                  quoteFile: true,
                  demandRef: true,
                  budget: true,
                }
              : {}
          }
          initialValues={{
            items: quoteObj
              ? quoteObj.items.map((item) => ({
                  quantity: item.quantity,
                  price: item.price,
                }))
              : items.map((item) => ({
                  quantity: item.quantity || "",
                  price: item.price || "",
                })),
            supplier: supplier ? supplier : "",
            quoteFile: "",
            demandRef: quoteObj ? quoteObj.corporate_demand_ref : "",
            budget: quoteObj ? quoteObj.budget : "",
          }}
          validateOnMount={!!quoteObj}
          enableReinitialize={true}
          validationSchema={formSchema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {({
            // Destructuring useful properties and functions from Formik
            handleChange,
            handleSubmit,
            values,
            handleBlur,
            touched,
            errors,
            isValid,
            setFieldTouched,
            dirty,
            setFieldValue,
          }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body className="d-flex flex-column p-4">
                  {/* Form Group for Supplier Selection */}
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="selectSupplier"
                    className="field-margin"
                  >
                    <Form.Label>Select Supplier</Form.Label>
                    {/* Dropdown for selecting supplier */}
                    <Form.Select
                      name="supplier"
                      value={values.supplier}
                      onChange={(event) => {
                        handleChange(event);
                        const { value } = event.target;
                        setSupplier(value);
                      }}
                    >
                      {/* Mapping over supplierSelectList to create dropdown options */}
                      <option value="" disabled>
                        -- Select Supplier --
                      </option>
                      {supplierSelectList.map((choice, index) => (
                        <option key={index} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.supplier}
                    </Form.Control.Feedback>
                    {!supplier && (
                      <Form.Text>
                        Choose a supplier to view it's products
                      </Form.Text>
                    )}
                  </Form.Group>

                  {/* Conditional rendering for displaying quote items */}
                  {items.length > 0 && productSelectList.length > 0 ? (
                    <div>
                      <div>
                        {/* Mapping and rendering each QuoteItemComponent */}
                        {items.map((item, index) => (
                          <QuoteItemComponent
                            // Passing necessary props to QuoteItemComponent
                            key={index}
                            editMode={!!quoteObj}
                            productList={productSelectList}
                            onItemChange={updateItem}
                            index={index}
                            item={item.product}
                            disabledOptions={items.map((item) => item.product)}
                            handleItemDelete={removeItem}
                            showRemoveButton={items.length === 1}
                            formik={{
                              handleChange,
                              values,
                              handleBlur,
                              touched,
                              errors,
                              setFieldTouched,
                              setFieldValue,
                            }}
                          />
                        ))}
                      </div>
                      {/* Button to add a new quote item */}
                      <Button
                        className="field-margin"
                        onClick={(e) => {
                          addItem(e);
                        }}
                        variant="outline-success"
                      >
                        <AddBoxIcon />
                      </Button>
                      <Form.Group
                        controlId="formOrderImages"
                        className="field-margin"
                      >
                        <Form.Label>Upload Quote File</Form.Label>
                        <Form.Control
                          type="file"
                          accept="application/pdf,
                                  application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                                  application/vnd.ms-excel,
                                  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                          name="quoteFile"
                          onChange={(event) => {
                            const files = Array.from(event.target.files);
                            handleFileChange(files[0]);
                            setFieldValue("quoteFile", files);
                          }}
                          isValid={touched.quoteFile && quoteFile}
                          isInvalid={
                            touched.quoteFile &&
                            (!!errors.quoteFile || !quoteFile)
                          }
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.quoteFile}
                        </Form.Control.Feedback>
                      </Form.Group>
                      {quoteFile && (
                        <div style={{ marginTop: "1.95rem" }}>
                          <a
                            href={
                              quoteFile instanceof Blob
                                ? URL.createObjectURL(quoteFile)
                                : quoteFile
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-dark"
                          >
                            {"View Quote File"}
                          </a>
                        </div>
                      )}
                      <Form.Group
                        controlId="demandRef"
                        className="field-margin"
                      >
                        <Form.Label>Demand Reference</Form.Label>
                        <Form.Control
                          type="text"
                          name="demandRef"
                          value={values.demandRef}
                          onChange={handleChange}
                          onFocus={() => setFieldTouched("demandRef", true)}
                          onBlur={handleBlur}
                          isInvalid={touched.demandRef && !!errors.demandRef}
                          isValid={touched.demandRef && !errors.demandRef}
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.demandRef}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group controlId="budget" className="field-margin">
                        <Form.Label>Budget</Form.Label>
                        <Form.Control
                          type="text"
                          name="budget"
                          value={values.budget}
                          onChange={handleChange}
                          onFocus={() => setFieldTouched("budget", true)}
                          onBlur={handleBlur}
                          isInvalid={touched.budget && !!errors.budget}
                          isValid={touched.budget && !errors.budget}
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.budget}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  ) : supplier ? (
                    <h6>This supplier has no products related to it</h6>
                  ) : null}
                </Modal.Body>
                <Modal.Footer>
                  {/* Submit and close buttons with conditional rendering and event handlers */}
                  {quoteObj?.status !== "Arrived, unfulfilled" &&
                  quoteObj?.status !== "Fulfilled" ? (
                    isSubmitting ? (
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
                      <Button
                        variant="primary"
                        disabled={!isValid || (!quoteObj && !dirty)}
                        onClick={handleSubmit}
                      >
                        {quoteObj ? "Save" : "Create"}
                      </Button>
                    )
                  ) : (
                    <h6 className="justify-content-lg-start">
                      Can't edit a quote associated with an order
                    </h6>
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
    </>
  );
};
export default QuoteModal;
