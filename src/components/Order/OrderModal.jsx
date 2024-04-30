import React, { useContext, useEffect, useState } from "react";
import { AppContext, OrderDeletionContext } from "../../App";
import {
  getOpenQuotesSelectList,
  getQuoteDetails,
} from "../../clients/quote_client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { createOrder, updateOrder } from "../../clients/order_client";
import * as yup from "yup";
import { Col, Form, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { PencilFill } from "react-bootstrap-icons";
import { showToast } from "../../config_and_helpers/helpers";
import { OrderContext } from "../../pages/Order/OrdersPage";
import OrderItemComponent from "./OrderItemComponent";

/**
 * ItemSchema Yup Validation Schema
 *
 * The validation schema for each individual item in the order.
 * Validates the quantity, expiry date, item fulfillment status, selected reason,
 * and other reason details of an item when item's fulfillment status marked as false.
 *
 * @type {Yup.object}
 */
const itemSchema = yup.object().shape({
  quantity: yup
    .string()
    .required("Quantity is required")
    .matches(/^\d+$/, "Quantity must be a positive number"),
  itemFulfilled: yup.boolean(),
  selectedReason: yup.string().when("itemFulfilled", function (itemFulfilled) {
    if (itemFulfilled === false) {
      return yup.string().required("Reason is required");
    }
    return yup.string();
  }),
  otherReasonDetail: yup
    .string()
    .when("selectedReason", function (selectedReason) {
      if (selectedReason === "Other") {
        return yup.string().required("Detail is required when status is Other");
      }
      return yup.string();
    }),
});

/**
 * createFormSchema Yup Validation Schema
 *
 * A factory function that returns a Yup object schema appropriate for validating the form used in the component.
 * It validates the items list, quote list, date of arrival, order images and received by fields.
 *
 * @param {boolean} hasExistingImages - A flag indicating whether there are existing images attached to the order
 * @returns {Yup.object} - A Yup validation schema
 */
const createFormSchema = ({ hasExistingImages }) =>
  yup.object().shape({
    items: yup.array().of(itemSchema),
    quoteList: yup.string(),
    arrivalDate: yup
      .date()
      .required("Arrival date is required.")
      .typeError("Invalid date format. Please enter a valid date."),
    orderImages: yup
      .mixed()
      .when([], () => {
        return hasExistingImages
          ? yup.mixed()
          : yup.mixed().required("Uploading order images is required.");
      })
      .test(
        "fileType",
        "Unsupported file format. Accepted formats are PDF, JPG, PNG, GIF.",
        (value) => {
          if (!value) return true; // Bypass the test if no file is uploaded
          return value.every((file) =>
            [
              "application/pdf",
              "image/jpeg",
              "image/png",
              "image/gif",
            ].includes(file.type),
          );
        },
      ),
    receivedBy: yup.string().required("Received by field is required."),
  });

/**
 * OrderModal Component
 *
 * This component is a bootstrapped Modal which presents a Form to the user.
 * The form is utilized to either create a new order or update an existing order.
 *
 * @component
 * @prop {function} onSuccessfulSubmit Function called when order is successfully submitted
 * @prop {object} orderObj Object of existing order when updating an order
 * @prop {boolean} homeShowModal Boolean used to manually control the showing of this modal
 * @prop {function} setHomeShowModal Function to sets the value of homeShowModal
 *
 * @example
 *
 * return (
 *   <OrderModal
 *     onSuccessfulSubmit={updateOrderList}
 *     orderObj={existingOrder}
 *     homeShowModal={modalVisible}
 *     setHomeShowModal={setModalVisible}
 *   />
 * );
 */
const OrderModal = ({
  onSuccessfulSubmit,
  orderObj,
  homeShowModal,
  setHomeShowModal,
}) => {
  // useContext - Fetches the user token from the overall app context.
  const { token } = useContext(AppContext);
  // Context to manage the re-rendering of the related product modals related to this order
  const { setOrderUpdated } = useContext(OrderContext);

  // useContext - Fetches the isOrderDeleted boolean in order to reset the openQuotesSelectList.
  const { isOrderDeleted, toggleOrderDeleted } =
    useContext(OrderDeletionContext);

  // useState - Initializes the state variables for the component.
  const [hasExistingImages, setHasExistingImages] = useState(false);
  const formSchema = createFormSchema({
    hasExistingImages,
  });
  const [relatedQuoteObj, setRelatedQuoteObj] = useState(null);
  const [openQuotesSelectList, setOpenQuotesSelectList] = useState([]);
  const [items, setItems] = useState(
    orderObj
      ? () => {
          return orderObj.items.map((item) => ({
            quote_item: {
              id: item.quote_item.id,
              quantity: item.quote_item.quantity,
            },
            quantity: item.quantity,
            stock_items: item.stock_items,
            status: item.status,
            issue_detail: item.issue_detail,
          }));
        }
      : [],
  );
  const [images, setImages] = useState(orderObj ? orderObj.images : []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(
    homeShowModal ? homeShowModal : false,
  );

  // Function to fetch a specific Quote data.
  const fetchQuote = (quoteId) => {
    getQuoteDetails(token, quoteId, setRelatedQuoteObj);
  };

  // useEffect Hook to load the list of open quotes when the component renders or when an order is deleted.
  useEffect(() => {
    getOpenQuotesSelectList(token, setOpenQuotesSelectList);
    if (isOrderDeleted) {
      toggleOrderDeleted();
    }
  }, [isOrderDeleted]);

  // useEffect Hook to set the Items state based on the relatedQuoteObj state.
  // Runs when relatedQuoteObj changes.
  useEffect(() => {
    if (relatedQuoteObj && !orderObj) {
      setItems(() => {
        return relatedQuoteObj.items.map((item) => {
          // Create an array of stock_items based on the quantity
          const stockItems = Array.from({ length: item.quantity }, () => ({
            expiry: "",
            batch: "",
          }));

          return {
            quote_item_id: item.id,
            cat_num: item.product.cat_num,
            quantity: item.quantity,
            status: "OK",
            stock_items: stockItems,
          };
        });
      });
    }
  }, [relatedQuoteObj]);

  // Function updateItem - Updates a specific item in the items state
  const updateItem = (orderItemIndex, field, value, stockItemIndex) => {
    const newItems = [...items];

    // Conditionally update the fields at the order item level or at the stock item level
    // inside the order item
    if (stockItemIndex != null) {
      newItems[orderItemIndex].stock_items[stockItemIndex][field] = value;
    } else {
      newItems[orderItemIndex][field] = value;
    }

    setItems(newItems);
  };

  // Function to handle file change events and update the images state.
  const handleFileChange = (files) => {
    const newImages = files.map((file) => ({
      file,
      id: `temp-${Date.now()}-${Math.random()}`,
    }));

    setImages((prevState) => [...prevState, ...newImages]);
  };

  // useEffect to check if images have been loaded, will update has existing
  useEffect(() => {
    if (images.length) {
      setHasExistingImages(true);
    } else {
      setHasExistingImages(false);
    }
  }, [images]);

  // HandleDeleteImage - Removes an image from the images state based on its ID.
  function handleDeleteImage(imageId) {
    setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
  }

  // handleClose - Function to handle the closing of the modal. It reverts all state to its original form.
  const handleClose = () => {
    if (setHomeShowModal) setHomeShowModal(false);
    setShowModal(false);
    setRelatedQuoteObj(null);
    setItems(
      orderObj
        ? () => {
            return orderObj.items.map((item) => ({
              quote_item: {
                id: item.quote_item.id,
                quantity: item.quote_item.quantity,
              },
              quantity: item.quantity,
              stock_items: item.stock_items,
              status: item.status,
              issue_detail: item.issue_detail,
            }));
          }
        : [],
    );
    setImages(orderObj ? orderObj.images : []);
  };

  // handleShow - Function to open the modal by setting showModal to true.
  const handleShow = () => setShowModal(true);

  // handleSubmit - Finishing up the form submission either creating a new order or updating an existing one.
  const handleSubmit = (values) => {
    // Indicates that the submission process has started, typically used to handle UI changes such as showing a loading spinner.
    setIsSubmitting(true);
    let finalItems, imagesToDelete;

    // Map over the items array in order to filter through the nested stock items arrays.
    // This results in only relevant data sent via the request preventing empty objects and array being sent through
    finalItems = items.map((item) => {
      const cleanStockItems = item.stock_items
        .map((stockItem) => {
          // First clean the empty fields
          let cleanStockItem = { ...stockItem };
          if (cleanStockItem.batch === "") delete cleanStockItem.batch;
          if (cleanStockItem.expiry === "") delete cleanStockItem.expiry;

          return cleanStockItem;
        })
        // Then filter through the stock items, returning only those that are not empty
        .filter((stockItem) => Object.keys(stockItem).length > 0);

      // Then completely remove the stock_items array if it's empty
      let finalItem = {
        ...item,
        stock_items: cleanStockItems,
      };

      if (finalItem.stock_items.length === 0) delete finalItem.stock_items;

      return finalItem;
    });

    // If the order object exists, it means we are updating an existing order.
    if (orderObj) {
      // Each item in the 'items' array is transformed to have the attributes: quote_item_id, quantity,
      // stock item details (batch and expiry), status, issue_detail.
      finalItems = finalItems.map((item) => ({
        ...item,
        quote_item_id: item.quote_item.id,
        quote_item: undefined,
      }));

      // Find images that are in the original order object but aren't present in the current image state - these images will be deleted.
      imagesToDelete = orderObj.images
        .filter((obj1) => !images.some((obj2) => obj1.id === obj2.id))
        .map((obj) => obj.id);
    }

    // Collect all validated data that will be sent to the server in the form.
    const updatedOrderData = {
      quote: orderObj ? orderObj.quote.id : relatedQuoteObj.id,
      arrival_date: values.arrivalDate,
      items: JSON.stringify(finalItems),
      received_by: values.receivedBy,
    };

    // If there are any images to delete, this data must be sent to the server as well.
    if (orderObj && imagesToDelete.length) {
      updatedOrderData.images_to_delete = JSON.stringify(imagesToDelete);
    }

    // Determine the new images that have been added for the order object.
    const newImages = images.filter((image) => image.file);

    // If there were new images added, we add that to the data to be sent to the server.
    if (newImages.length) {
      const imageInfo = newImages.map((image) => ({
        id: image.id,
        type: image.file.type,
      }));
      updatedOrderData.images = JSON.stringify(imageInfo);
    }

    //We send the request to the server using a promise - if we have an order object, it mean's we're updating an
    // existing order, otherwise, we're creating a new order.
    const orderPromise = orderObj
      ? updateOrder(token, orderObj.id, updatedOrderData, newImages)
      : createOrder(token, updatedOrderData, images);

    //Once the promise resolves (i.e., the request is completed), we look at the response. If it was successful,
    // we perform necessary UI update and call the onSuccessfulSubmit function and make sure to update
    // the orderUpdated context.
    orderPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulSubmit();
          response.toast();
          setIsSubmitting(false);
          handleClose();
          if (orderObj) setOrderUpdated(true);
        }, 1000);
      } else {
        // If there was an error, we halt the submission process and display a notification with the error message.
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
      {/* Render Create Order or Edit buttons based on whether orderObj is present,
       onClick calls a function to handle modal visibility */}
      {!homeShowModal && (
        <Button
          variant={orderObj ? "outline-success" : "success"}
          onClick={handleShow}
        >
          {orderObj ? <PencilFill /> : "Create Order"}
        </Button>
      )}

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{orderObj ? "Edit" : "Create"} Order</Modal.Title>
        </Modal.Header>
        {/* The Formik component is being utilized for form handling,
         providing APIs for commonly needed form operations. */}
        {/* It uses 'orderObj' to conditionally setup its properties
        for the modal's create or edit forms. */}
        <Formik
          // The items array is passed in as a key to make sure the form is updated when the items state is updated
          key={[items, relatedQuoteObj]}
          enableReinitialize={true}
          initialTouched={
            orderObj
              ? {
                  items: orderObj.items.map((item) => ({
                    stock_items: item.stock_items.map(() => ({
                      expiry: true,
                      batch: true,
                    })),
                    itemFulfilled: true,
                    otherReasonDetail: true,
                  })),
                  quoteList: true,
                  arrivalDate: true,
                  orderImages: true,
                  receivedBy: true,
                }
              : {
                  items: items.map((item) => ({
                    stock_items: item.stock_items.map(() => ({
                      expiry: false,
                      batch: false,
                    })),
                    itemFulfilled: false,
                    otherReasonDetail: false,
                  })),
                  quoteList: false,
                  arrivalDate: false,
                  orderImages: false,
                  receivedBy: false,
                }
          }
          initialValues={{
            items: items.map((item) => ({
              quantity: item.quantity,
              stock_items: item.stock_items,
              itemFulfilled: item.status === "OK",
              selectedReason: item.status || "",
              otherReasonDetail: item.issue_detail || "",
            })),
            quoteList: relatedQuoteObj ? relatedQuoteObj.id : "",
            arrivalDate: orderObj
              ? orderObj.arrival_date
              : new Date().toISOString().split("T")[0],
            orderImages: orderObj ? "" : null,
            receivedBy: orderObj ? orderObj.received_by : "",
          }}
          validateOnMount={!!orderObj}
          validationSchema={formSchema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {({
            handleChange,
            handleSubmit,
            values,
            handleBlur,
            touched,
            errors,
            setFieldTouched,
            isValid,
            dirty,
            setFieldValue,
          }) => {
            // Formik provides these props to be utilized in the form fields for handling form state.
            return (
              // The form itself
              <Form noValidate onSubmit={handleSubmit}>
                {/* Some more components with their respective forms and form fields */}
                {/* Additionally, there's conditional rendering to dynamically create JSX based on whether
                 you're editing or creating an order. */}
                <Modal.Body className="d-flex flex-column p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    {/* Selection of Quote */}
                    {!orderObj && (
                      <Form.Group
                        as={Col}
                        md="8"
                        controlId="selectQuote"
                        className="field-margin"
                      >
                        <Form.Label>Select Quote</Form.Label>
                        <Form.Select
                          name="quoteList"
                          value={values.quoteList}
                          onChange={(event) => {
                            const { value } = event.target;
                            handleChange(event);
                            fetchQuote(value);
                          }}
                        >
                          <option value="" disabled>
                            -- Select Quote --
                          </option>
                          {openQuotesSelectList.map((choice, index) => (
                            <option key={index} value={choice.value}>
                              {choice.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.quoteList}
                        </Form.Control.Feedback>
                        {!relatedQuoteObj && (
                          <Form.Text>
                            Choose a quote to view it's details
                          </Form.Text>
                        )}
                      </Form.Group>
                    )}

                    {/* Link to Quote */}
                    {relatedQuoteObj && !orderObj && (
                      <div style={{ marginTop: "1.95rem" }}>
                        <a
                          href={
                            relatedQuoteObj?.quote_url instanceof Blob
                              ? URL.createObjectURL(relatedQuoteObj.quote_url)
                              : relatedQuoteObj?.quote_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-dark"
                        >
                          {orderObj && "View Quote "}
                          <PictureAsPdfIcon />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Link to Quote for orderObj scenario*/}
                  {orderObj && (
                    <a
                      href={
                        orderObj?.quote?.quote_url instanceof Blob
                          ? URL.createObjectURL(orderObj.quote.quote_url)
                          : orderObj?.quote?.quote_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-dark"
                      style={{ margin: "1rem" }}
                    >
                      {orderObj && "View Quote "}
                      <PictureAsPdfIcon />
                    </a>
                  )}

                  {/* Displaying Items */}
                  {items && (relatedQuoteObj || orderObj) && (
                    <>
                      <h2>
                        Supplier:{" "}
                        {orderObj
                          ? orderObj.supplier.name
                          : relatedQuoteObj.supplier.name}
                      </h2>
                      {/* Mapping through items */}
                      {items.map((item, index) =>
                        /* order item component representing each ordered item in modal,
                         along with all necessary props */
                        (
                          orderObj
                            ? orderObj.items[index]
                            : relatedQuoteObj.items[index]
                        ) ? (
                          <OrderItemComponent
                            key={
                              orderObj
                                ? `${orderObj.quote.id}-${index}`
                                : `${relatedQuoteObj.id}-${index}`
                            }
                            product={
                              orderObj
                                ? orderObj.items[index].product
                                : relatedQuoteObj.items[index].product
                            }
                            orderObjItemStockItems={
                              orderObj
                                ? orderObj.items[index].stock_items
                                : null
                            }
                            orderObjItemQuantity={
                              orderObj ? orderObj.items[index].quantity : null
                            }
                            onItemChange={updateItem}
                            orderItemIndex={index}
                            item={item}
                            quoteItem={
                              orderObj ? null : relatedQuoteObj.items[index]
                            }
                            orderItemStatus={
                              orderObj ? orderObj.items[index].status : null
                            }
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
                        ) : null,
                      )}
                    </>
                  )}

                  {/* Other Order Attributes */}
                  {(relatedQuoteObj || orderObj) && (
                    <>
                      {/* Group to upload Receipt images */}
                      <Form.Group
                        controlId="formOrderImages"
                        className="field-margin"
                      >
                        <Form.Label>
                          Upload Order Receipt (pdf, jpg, png, gif)
                        </Form.Label>
                        <Form.Control
                          type="file"
                          multiple
                          accept="application/pdf, image/*"
                          title="Accepted formats: pdf, jpg, png, gif"
                          name="orderImages"
                          onChange={(event) => {
                            const files = Array.from(event.target.files);
                            handleFileChange(files);
                            setFieldValue("orderImages", files);
                          }}
                          isValid={values.orderImages && images.length}
                          isInvalid={
                            touched.orderImages &&
                            (!!errors.orderImages || !images.length)
                          }
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.orderImages}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <div>
                        {/* Display of Existing Images */}
                        <div className="field-margin">
                          {images.map((image) => {
                            let imageUrl =
                              image.image_url ||
                              URL.createObjectURL(image.file);

                            const isPdf = imageUrl
                              .toLowerCase()
                              .endsWith(".pdf");

                            return (
                              <div key={image.id}>
                                {isPdf ? (
                                  <>
                                    <a
                                      href={imageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-dark"
                                      style={{ width: "200px" }}
                                    >
                                      <PictureAsPdfIcon />
                                    </a>
                                    <DeleteIcon
                                      onClick={() =>
                                        handleDeleteImage(image.id)
                                      }
                                      style={{ cursor: "pointer" }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <a
                                      href={imageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <img
                                        src={imageUrl}
                                        alt={`product-${values.catalogueNumber}-image-${image.id}`}
                                        width="200"
                                      />
                                    </a>
                                    <DeleteIcon
                                      onClick={() =>
                                        handleDeleteImage(image.id)
                                      }
                                      style={{ cursor: "pointer" }}
                                    />
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Field for Arrival Date */}
                      <Form.Group
                        controlId="formArrivalDate"
                        className="field-margin"
                      >
                        <Form.Label>Arrival Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="arrivalDate"
                          value={values.arrivalDate}
                          onChange={(e) => {
                            handleChange(e);
                            setFieldValue("arrivalDate", e.target.value);
                          }}
                          onFocus={() => setFieldTouched("arrivalDate", true)}
                          onBlur={handleBlur}
                          isInvalid={
                            touched.arrivalDate && !!errors.arrivalDate
                          }
                          isValid={touched.arrivalDate && !errors.arrivalDate}
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.arrivalDate}
                        </Form.Control.Feedback>
                      </Form.Group>

                      {/* Field for Receiver */}
                      <Form.Group
                        controlId="receivedBy"
                        className="field-margin"
                      >
                        <Form.Label>Received By</Form.Label>
                        <Form.Control
                          type="text"
                          name="receivedBy"
                          value={values.receivedBy}
                          onChange={handleChange}
                          onFocus={() => setFieldTouched("receivedBy", true)}
                          onBlur={handleBlur}
                          isInvalid={touched.receivedBy && !!errors.receivedBy}
                          isValid={touched.receivedBy && !errors.receivedBy}
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.receivedBy}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  {/* Buttons for submitting and closing modal */}
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
                      disabled={!isValid || (!orderObj && !dirty)}
                      onClick={handleSubmit}
                    >
                      {orderObj ? "Save" : "Create"}
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
export default OrderModal;
