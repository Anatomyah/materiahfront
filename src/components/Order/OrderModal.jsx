import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import {
  getOpenQuotesSelectList,
  getQuoteDetails,
} from "../../clients/quote_client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OrderItemComponent from "./OrderItemComponent";
import { allOrderItemsFilled } from "../../config_and_helpers/helpers";
import { createOrder } from "../../clients/order_client";
import * as yup from "yup";
import { Col, Form } from "react-bootstrap";
import { Formik } from "formik";
import DeleteIcon from "@mui/icons-material/Delete";

const itemSchema = yup.object().shape({
  quantity: yup
    .number()
    .required("Quantity is required")
    .positive("Quantity must be positive")
    .integer("Quantity must be an integer"),
  batch: yup.string().required("Batch number is required"),
  expiryDate: yup
    .date()
    .required("Expiry date is required")
    .min(new Date(), "Expiry date cannot be in the past"),
  itemFulfilled: yup.boolean(),
  selectedReason: yup.string().when("itemFulfilled", function (itemFulfilled) {
    if (itemFulfilled === false) {
      return yup.string().required("Reason is required");
    }
    return yup.string(); // Or yup.string().nullable() if the field can be empty
  }),
  otherReasonDetail: yup
    .string()
    .when("selectedReason", function (selectedReason) {
      if (selectedReason === "Other") {
        return yup.string().required("Detail is required when status is Other");
      }
      return yup.string(); // Or yup.string().nullable() if the field can be empty
    }),
});

const schema = yup.object().shape({
  items: yup.array().of(itemSchema),
  quoteList: yup.string().required("Selecting a quote is required."),
  arrivalDate: yup
    .date()
    .required("Arrival date is required.")
    .typeError("Invalid date format. Please enter a valid date."),
  orderImages: yup
    .mixed()
    .required("Uploading order images is required.")
    .test(
      "fileType",
      "Unsupported file format. Accepted formats are PDF, JPG, PNG, GIF.",
      (value) => {
        if (!value) return true; // Bypass the test if no file is uploaded
        return value.every((file) =>
          ["application/pdf", "image/jpeg", "image/png", "image/gif"].includes(
            file.type,
          ),
        );
      },
    ),
  receivedBy: yup
    .string()
    .required("Received by field is required.")
    .matches(/^[a-zA-Z\s]+$/, "Received by must contain only English letters."),
});

const OrderModal = ({ onSuccessfulCreate }) => {
  const { token } = useContext(AppContext);
  const [relatedQuoteObj, setRelatedQuoteObj] = useState(null);
  const [supplier, setSupplier] = useState("");
  const [openQuotesSelectList, setOpenQuotesSelectList] = useState([]);
  const [items, setItems] = useState([]);
  const [images, setImages] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const fetchQuote = (quoteId) => {
    getQuoteDetails(token, quoteId, setRelatedQuoteObj).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  useEffect(() => {
    console.log(images);
  }, [images]);

  useEffect(() => {
    getOpenQuotesSelectList(token, setOpenQuotesSelectList).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, []);

  useEffect(() => {
    if (relatedQuoteObj) {
      setSupplier(relatedQuoteObj.supplier.name);
      setItems(() => {
        return relatedQuoteObj.items.map((item) => ({
          quote_item_id: item.id,
          cat_num: item.product.cat_num,
          quantity: item.quantity,
          status: "OK",
        }));
      });
    }
  }, [relatedQuoteObj]);

  useEffect(() => {
    const itemsValidation = allOrderItemsFilled(items);
  }, [items]);

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

  function handleDeleteImage(imageId) {
    setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
  }

  const handleClose = () => {
    setErrorMessages([]);
    setShowModal(false);
    setRelatedQuoteObj(null);
  };

  const handleShow = () => setShowModal(true);

  const handleSubmit = (values) => {
    setErrorMessages([]);

    const formData = new FormData();
    formData.append("quote", relatedQuoteObj.id);
    formData.append("arrival_date", values.arrivalDate);
    formData.append("items", JSON.stringify(items));
    formData.append("received_by", values.receivedBy);
    if (images.length) {
      const imageInfo = images.map((image) => ({
        id: image.id,
        type: image.file.type,
      }));
      formData.append("images", JSON.stringify(imageInfo));
    }

    createOrder(token, formData, images).then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulCreate();
        }, 1500);
        handleClose();
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  if (!openQuotesSelectList) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Create Order
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Order</Modal.Title>
        </Modal.Header>
        <Formik
          key={items.length}
          initialValues={{
            items: items.map((item) => ({
              quantity: item.quantity || "",
              batch: item.batch || "",
              expiryDate: item.expiry || new Date().toISOString().split("T")[0],
              itemFulfilled: item.status ? item.status === "OK" : true,
              selectedReason: item.status === "Other" || false,
              otherReasonDetail: item.issue_detail || "",
            })),
            quoteList: relatedQuoteObj ? relatedQuoteObj.id : "",
            arrivalDate: new Date().toISOString().split("T")[0],
            orderImages: "",
            receivedBy: "",
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {({
            handleChange,
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
                        console.log(event);
                        const { value } = event.target;
                        fetchQuote(value);
                        setFieldValue("quoteList", value);
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
                    {!relatedQuoteObj ? (
                      <Form.Text>Choose a quote to view it's details</Form.Text>
                    ) : (
                      <a
                        href={
                          relatedQuoteObj.quote_url instanceof Blob
                            ? URL.createObjectURL(relatedQuoteObj.quote_url)
                            : relatedQuoteObj.quote_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary mt-1"
                      >
                        View Quote
                      </a>
                    )}
                  </Form.Group>
                  {relatedQuoteObj && items && (
                    <>
                      <h2>Supplier: {supplier}</h2>
                      {items.map((item, index) =>
                        relatedQuoteObj.items[index] ? (
                          <OrderItemComponent
                            key={`${relatedQuoteObj.id}-${index}`}
                            product={relatedQuoteObj.items[index].product}
                            onItemChange={updateItem}
                            index={index}
                            item={item}
                            quoteItem={relatedQuoteObj.items[index]}
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
                  {relatedQuoteObj && (
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
                            return (
                              <div key={image.id}>
                                <a
                                  href={imageUrl}
                                  key={image.id}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`order-quote-${relatedQuoteObj.id}-image-${image.id}`}
                                    width="200"
                                  />
                                </a>
                                <DeleteIcon
                                  onClick={() => handleDeleteImage(image.id)}
                                  style={{ cursor: "pointer" }}
                                />
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
                  {Object.keys(errorMessages).length > 0 && (
                    <ul>
                      {Object.keys(errorMessages).map((key, index) => {
                        return errorMessages[key].map((error, subIndex) => (
                          <li
                            key={`${index}-${subIndex}`}
                            className="text-danger fw-bold"
                          >
                            {error}
                          </li>
                        ));
                      })}
                    </ul>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="primary"
                    disabled={!isValid || !dirty}
                    onClick={handleSubmit}
                  >
                    Reset Password
                  </Button>
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
