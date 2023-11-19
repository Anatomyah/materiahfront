import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import {
  getOpenQuotesSelectList,
  getQuoteDetails,
} from "../../clients/quote_client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OrderItemComponent from "./OrderItemComponent";
import { createOrder, updateOrder } from "../../clients/order_client";
import * as yup from "yup";
import { Col, Form, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EditIcon from "@mui/icons-material/Edit";
import { showToast } from "../../config_and_helpers/helpers";

const itemSchema = yup.object().shape({
  quantity: yup
    .string()
    .required("Quantity is required")
    .matches(/^\d+$/, "Quantity must be a number"),
  batch: yup.string().required("Batch number is required"),
  expiryDate: yup.date().required("Expiry date is required"),
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
    receivedBy: yup
      .string()
      .required("Received by field is required.")
      .matches(
        /^[a-zA-Z\s]+$/,
        "Received by must contain only English letters.",
      ),
  });

const OrderModal = ({ onSuccessfulSubmit, orderObj }) => {
  const { token } = useContext(AppContext);
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
            batch: item.batch,
            expiry: item.expiry,
            status: item.status,
            issue_detail: item.issue_detail,
          }));
        }
      : [],
  );
  const [images, setImages] = useState(orderObj ? orderObj.images : []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const fetchQuote = (quoteId) => {
    getQuoteDetails(token, quoteId, setRelatedQuoteObj);
  };

  useEffect(() => {
    getOpenQuotesSelectList(token, setOpenQuotesSelectList);
  }, []);

  useEffect(() => {
    if (relatedQuoteObj && !orderObj) {
      setItems(() => {
        return relatedQuoteObj.items.map((item) => ({
          quote_item_id: item.id,
          cat_num: item.product.cat_num,
          quantity: item.quantity,
          expiry: new Date().toISOString().split("T")[0],
          status: "OK",
        }));
      });
    }
  }, [relatedQuoteObj]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleFileChange = (files) => {
    const newImages = files.map((file) => ({
      file,
      id: `temp-${Date.now()}-${Math.random()}`,
    }));

    setImages((prevState) => [...prevState, ...newImages]);
  };

  useEffect(() => {
    if (images.length) {
      setHasExistingImages(true);
    } else {
      setHasExistingImages(false);
    }
  }, [images]);

  function handleDeleteImage(imageId) {
    setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
  }

  const handleClose = () => {
    setIsSubmitting(false);
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
              batch: item.batch,
              expiry: item.expiry,
              status: item.status,
              issue_detail: item.issue_detail,
            }));
          }
        : [],
    );
    setImages(orderObj ? orderObj.images : []);
  };

  const handleShow = () => setShowModal(true);

  const handleSubmit = (values) => {
    setIsSubmitting(true);
    let finalItems, imagesToDelete;

    if (orderObj) {
      finalItems = items.map((item) => ({
        quote_item_id: item.quote_item.id,
        quantity: item.quantity,
        batch: item.batch,
        expiry: item.expiry,
        status: item.status,
        issue_detail: item.issue_detail,
      }));

      imagesToDelete = orderObj.images
        .filter((obj1) => !images.some((obj2) => obj1.id === obj2.id))
        .map((obj) => obj.id);
    }

    const updatedOrderData = {
      quote: orderObj ? orderObj.quote.id : relatedQuoteObj.id,
      arrival_date: values.arrivalDate,
      items: JSON.stringify(orderObj ? finalItems : items),
      received_by: values.receivedBy,
    };

    if (orderObj && imagesToDelete.length) {
      updatedOrderData.images_to_delete = JSON.stringify(imagesToDelete);
    }

    const newImages = images.filter((image) => image.file);

    if (newImages.length) {
      const imageInfo = newImages.map((image) => ({
        id: image.id,
        type: image.file.type,
      }));
      updatedOrderData.images = JSON.stringify(imageInfo);
    }

    const orderPromise = orderObj
      ? updateOrder(token, orderObj.id, updatedOrderData, newImages)
      : createOrder(token, updatedOrderData, images);

    orderPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulSubmit();
          handleClose();
          response.toast();
        }, 1500);
      } else {
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
        );
      }
    });
  };

  if (!openQuotesSelectList.length) {
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
    <>
      <Button
        variant={orderObj ? "outline-success" : "success"}
        onClick={handleShow}
      >
        {orderObj ? <EditIcon /> : "Create Order"}
      </Button>

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{orderObj ? "Edit" : "Create"} Order</Modal.Title>
        </Modal.Header>
        <Formik
          key={items.length}
          initialTouched={
            orderObj
              ? {
                  items: orderObj.items.map(() => ({
                    quantity: true,
                    batch: true,
                    expiryDate: true,
                    itemFulfilled: true,
                    otherReasonDetail: true,
                  })),
                  quoteList: true,
                  arrivalDate: true,
                  orderImages: true,
                  receivedBy: true,
                }
              : {}
          }
          initialValues={{
            items: orderObj
              ? orderObj.items.map((item) => ({
                  quantity: item.quantity,
                  batch: item.batch,
                  expiryDate: item.expiry,
                  itemFulfilled: item.status === "OK" || false,
                  otherReasonDetail: item.issue_detail || "",
                }))
              : items.map((item) => ({
                  quantity: item.quantity || "",
                  batch: item.batch || "",
                  expiryDate:
                    item.expiry || new Date().toISOString().split("T")[0],
                  itemFulfilled: item.status ? item.status === "OK" : true,
                  selectedReason: item.status === "Other" || false,
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
          enableReinitialize={true}
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
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body className="d-flex flex-column p-4">
                  <div className="d-flex justify-content-between align-items-start">
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
                            handleChange(event);
                            const { value } = event.target;
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
                  {items && (relatedQuoteObj || orderObj) && (
                    <>
                      <h2>
                        Supplier:{" "}
                        {orderObj
                          ? orderObj.supplier.name
                          : relatedQuoteObj.supplier.name}
                      </h2>
                      {items.map((item, index) =>
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
                            onItemChange={updateItem}
                            index={index}
                            item={item}
                            quoteItem={
                              orderObj ? null : relatedQuoteObj.items[index]
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
                  {(relatedQuoteObj || orderObj) && (
                    <>
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
                        <div className="field-margin">
                          {images.map((image) => {
                            let imageUrl =
                              image.image_url ||
                              URL.createObjectURL(image.file);

                            // Check if the file is a PDF by looking at the URL extension
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
