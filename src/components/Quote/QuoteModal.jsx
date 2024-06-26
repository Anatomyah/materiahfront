import React, { useContext, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { getSupplierSelectList } from "../../clients/supplier_client";
import { getProductSelectList } from "../../clients/product_client";
import { createQuoteManually, updateQuote } from "../../clients/quote_client";
import QuoteItemComponent from "./QuoteItemComponent";
import * as yup from "yup";
import { Formik } from "formik";
import { Col, Form, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { PencilFill, Plus } from "react-bootstrap-icons";

import { showToast } from "../../config_and_helpers/helpers";
import RequiredAsteriskComponent from "../Generic/RequiredAsteriskComponent";

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
  discount: yup
    .string()
    .matches(/^\d+(\.\d+)?$/, "Discount percentage must be a valid number"),
  currency: yup.string().required("Currency is required"),
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
 * Represents a QuoteModal component.
 * @constructor
 * @param {Object} props - The component props.
 * @param {Function} props.onSuccessfulSubmit - The callback function to be called on successful form submission.
 * @param {Object} props.quoteObj - The quote object.
 * @param {boolean} props.homeShowModal - Flag indicating whether the modal should be shown on the home page.
 * @param {Function} props.setHomeShowModal - The function to set the flag indicating whether the modal should be shown on the home page.
 * @param {Function} props.clearSearchValue - The function to clear the search value.
 * @param {boolean} props.disableEdit - Flag indicating whether editing is disabled.
 */

const QuoteModal = ({
  onSuccessfulSubmit,
  quoteObj,
  homeShowModal,
  setHomeShowModal,
  clearSearchValue,
  disableEdit,
}) => {
  const { token } = useContext(AppContext);

  // useRef to indicate when products are fetched
  const fetchingProductsRef = useRef(null);

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
            discount: item.discount || "",
            currency: item.currency || "",
          }));
        }
      : [
          {
            product: "",
            quantity: "",
            price: "",
            discount: "",
            currency: "",
          },
        ],
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
    getProductSelectList(token, setProductSelectList, supplier).then(() => {
      fetchingProductsRef.current = false;
    });
  };

  // Initialize a default item in the form when the product list is loaded
  useEffect(() => {
    if (productSelectList.length && items.length === 0) {
      setItems([
        { product: "", quantity: "", price: "", discount: "", currency: "" },
      ]);
    }
  }, [productSelectList]);

  // Fetch product list based on selected supplier
  useEffect(() => {
    if (supplier) {
      fetchingProductsRef.current = true;
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
      setItems([
        { product: "", quantity: "", price: "", discount: "", currency: "" },
      ]);
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
    setItems([
      ...items,
      { product: "", quantity: "", price: "", discount: "", currency: "" },
    ]);
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
          if (clearSearchValue) clearSearchValue();
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

  // A function called upon to render editing button
  // If disableEdit is true, button is rendered disabled with an Overlay trigger
  const renderButton = () => {
    // Tooltip rendering function
    const renderTooltip = (props) => (
      <Tooltip id={`tooltip-delete-${quoteObj.id}`} {...props}>
        Cannot edit: Quote linked to an order.
      </Tooltip>
    );

    if (disableEdit) {
      return (
        <OverlayTrigger
          overlay={renderTooltip}
          placement="top"
          delay={{ show: 50, hide: 400 }}
        >
          <span className="d-inline-block">
            <Button
              variant={quoteObj ? "outline-success" : "success"}
              onClick={handleShow}
              disabled
              style={{ pointerEvents: "none" }}
            >
              {quoteObj ? <PencilFill /> : "Create Quote"}
            </Button>
          </span>
        </OverlayTrigger>
      );
    } else {
      return (
        <Button
          variant={quoteObj ? "outline-success" : "success"}
          onClick={handleShow}
        >
          {quoteObj ? <PencilFill /> : "Create Quote"}
        </Button>
      );
    }
  };

  return (
    <>
      {/* Button to trigger the modal - conditional render based on quoteObj existence */}
      {!homeShowModal && renderButton()}

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
                    currency: true,
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
                  discount: item?.discount || "",
                  currency: item.currency || "",
                }))
              : items.map((item) => ({
                  quantity: item.quantity || "",
                  price: item.price || "",
                  discount: item?.discount || "",
                  currency: item.currency || "",
                })),
            supplier: supplier ? supplier : "",
            quoteFile: "",
            demandRef: quoteObj ? quoteObj.corporate_demand_ref : "",
            budget: quoteObj ? quoteObj.budget : "",
          }}
          validateOnMount={!!quoteObj}
          // enableReinitialize={true}
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
                        <Plus size={30} />
                      </Button>
                      <Form.Group
                        controlId="formOrderImages"
                        className="field-margin"
                      >
                        <Form.Label>
                          Upload Quote File <RequiredAsteriskComponent />
                        </Form.Label>
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
                          onBlur={handleBlur}
                          isValid={!errors.quoteFile && values.quoteFile}
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
                        <div style={{ marginTop: "1 rem" }}>
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
                        <Form.Label className="mt-3">
                          Demand Reference <RequiredAsteriskComponent />
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="demandRef"
                          value={values.demandRef}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isValid={!errors?.demandRef && values?.demandRef}
                          isInvalid={
                            (touched?.demandRef && !values?.demandRef) ||
                            (errors?.demandRef &&
                              errors?.demandRef !==
                                "Demand reference is required" &&
                              values?.demandRef)
                          }
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.demandRef}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group controlId="budget" className="field-margin">
                        <Form.Label>
                          Budget <RequiredAsteriskComponent />
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="budget"
                          value={values.budget}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isValid={!errors?.budget && values?.budget}
                          isInvalid={
                            (touched?.budget && !values?.budget) ||
                            (errors?.budget &&
                              errors?.budget !== "Budget number is required" &&
                              values?.budget)
                          }
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
                    fetchingProductsRef.current ? (
                      <Spinner size={"sm"} variant={"dark"} />
                    ) : (
                      <h6>This supplier has no products related to it</h6>
                    )
                  ) : null}
                </Modal.Body>
                <Modal.Footer>
                  {/* Submit and close buttons with conditional rendering and event handlers */}
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
                    <Button
                      variant="primary"
                      disabled={!isValid || (!quoteObj && !dirty)}
                      onClick={handleSubmit}
                    >
                      {quoteObj ? "Save" : "Create"}
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
    </>
  );
};
export default QuoteModal;
