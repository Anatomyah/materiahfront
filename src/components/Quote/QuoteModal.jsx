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
import { Col, Form, Spinner } from "react-bootstrap";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EditIcon from "@mui/icons-material/Edit";
import { showToast } from "../../config_and_helpers/helpers";

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

const createFormSchema = ({ hasQuotePdf }) =>
  yup.object().shape({
    items: yup.array().of(itemSchema),
    supplier: yup.string().required("Supplier is required"),
    quotePdf: yup
      .mixed()
      .when([], () => {
        return hasQuotePdf
          ? yup.mixed()
          : yup.mixed().required("Uploading a quote PDF is required.");
      })
      .test(
        "fileType",
        "Unsupported file format. Only PDF format is accepted.",
        (value) => {
          if (!value) return true; // Bypass the test if no file is uploaded
          return value.every((file) => ["application/pdf"].includes(file.type));
        },
      ),
  });

const QuoteModal = ({
  onSuccessfulSubmit,
  quoteObj,
  homeShowModal,
  setHomeShowModal,
}) => {
  const { token } = useContext(AppContext);
  const [hasQuotePdf, setHasQuotePdf] = useState(false);
  const formSchema = createFormSchema({
    hasQuotePdf,
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

  useEffect(() => {
    console.log(supplier);
  }, [supplier]);

  useEffect(() => {
    if (quoteFile) {
      setHasQuotePdf(true);
    } else {
      setHasQuotePdf(false);
    }
  }, [quoteFile]);

  useEffect(() => {
    getSupplierSelectList(token, setSupplierSelectList);
  }, []);

  const fetchProductSelectList = () => {
    getProductSelectList(token, setProductSelectList, supplier);
  };

  useEffect(() => {
    if (productSelectList.length && items.length === 0) {
      setItems([{ product: "", quantity: "", price: "" }]);
    }
  }, [productSelectList]);

  useEffect(() => {
    if (supplier) {
      fetchProductSelectList();
    }
  }, [supplier]);

  const handleClose = () => {
    if (setHomeShowModal) setHomeShowModal(false);
    resetModal();
    setShowModal(false);
  };

  const resetModal = () => {
    if (!quoteObj) {
      setQuoteFile("");
      setItems([{ product: "", quantity: "", price: "" }]);
    }
  };

  const handleShow = () => setShowModal(true);

  const handleFileChange = (file) => {
    if (file) {
      setQuoteFile(file);
    }
    setFileChanged(true);
  };

  const addItem = (e) => {
    e.preventDefault();
    setItems([...items, { product: "", quantity: "", price: "" }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (e, index) => {
    e.preventDefault();
    if (items.length === 1) {
      return;
    }
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = (values) => {
    setIsSubmitting(true);

    const quoteData = {
      supplier: values.supplier,
      items: JSON.stringify(items),
    };

    if (quoteFile && fileChanged) {
      quoteData.quote_file_type = quoteFile.type;
    }

    const quotePromise = quoteObj
      ? updateQuote(
          token,
          quoteObj.id,
          quoteData,
          fileChanged ? quoteFile : null,
        )
      : createQuoteManually(token, quoteData, quoteFile);

    quotePromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulSubmit();
          response.toast();
          resetModal();
          setIsSubmitting(false);
          handleClose();
        }, 1000);
      } else {
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
        );
        setIsSubmitting(false);
      }
    });
  };

  if (!supplierSelectList.length) {
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
      {!homeShowModal && (
        <Button
          variant={quoteObj ? "outline-success" : "success"}
          onClick={handleShow}
        >
          {quoteObj ? <EditIcon /> : "Create Quote"}
        </Button>
      )}

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{quoteObj ? "Edit" : "Create"} Quote</Modal.Title>
        </Modal.Header>
        <Formik
          key={items.length}
          initialTouched={
            quoteObj
              ? {
                  items: quoteObj.items.map(() => ({
                    quantity: true,
                    price: true,
                  })),
                  supplier: true,
                  quotePdf: true,
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
            quotePdf: "",
          }}
          validateOnMount={!!quoteObj}
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
            isValid,
            setFieldTouched,
            dirty,
            setFieldValue,
          }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body className="d-flex flex-column p-4">
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="selectSupplier"
                    className="field-margin"
                  >
                    <Form.Label>Select Supplier</Form.Label>
                    <Form.Select
                      name="supplier"
                      value={values.supplier}
                      onChange={(event) => {
                        handleChange(event);
                        const { value } = event.target;
                        setSupplier(value);
                      }}
                    >
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
                  {items.length > 0 && productSelectList.length > 0 ? (
                    <div>
                      <div>
                        {items.map((item, index) => (
                          <QuoteItemComponent
                            key={index}
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
                        <Form.Label>Upload Quote (pdf)</Form.Label>
                        <Form.Control
                          type="file"
                          accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          name="quotePdf"
                          onChange={(event) => {
                            const files = Array.from(event.target.files);
                            handleFileChange(files[0]);
                            setFieldValue("quotePdf", files);
                          }}
                          isValid={touched.quotePdf && quoteFile}
                          isInvalid={
                            touched.quotePdf &&
                            (!!errors.quotePdf || !quoteFile)
                          }
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.quotePdf}
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
                            {"View Quote "}
                            <PictureAsPdfIcon />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : supplier ? (
                    <h6>This supplier has no products related to it</h6>
                  ) : null}
                </Modal.Body>
                <Modal.Footer>
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
