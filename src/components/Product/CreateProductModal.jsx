import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_MEASUREMENT_UNITS,
  PRODUCT_STORAGE_OPTIONS,
} from "../../config_and_helpers/config";
import { AppContext } from "../../App";
import { checkCatNum, createProduct } from "../../clients/product_client";
import { getManufacturerSelectList } from "../../clients/manufacturer_client";
import { getSupplierSelectList } from "../../clients/supplier_client";
import * as yup from "yup";
import { Formik } from "formik";
import { Col, Form } from "react-bootstrap";
import "./ProductComponentStyle.css";
import "font-awesome/css/font-awesome.min.css";
import DeleteIcon from "@mui/icons-material/Delete";
import debounce from "lodash/debounce";

const debouncedCheckCatNum = debounce(checkCatNum, 2000);

const createFormSchema = ({ token, isSupplier }) =>
  yup.object().shape({
    productName: yup
      .string()
      .required("Product name is required")
      .min(2, "Product name must be at least 2 characters long")
      .test(
        "is-english",
        "Username must be in English. No special characters, either.",
        (value) => {
          return /^[a-zA-Z0-9\s]+$/.test(value);
        },
      ),
    catalogueNumber: yup
      .string()
      .required("Catalogue number is required")
      .min(2, "Catalogue number must be at least 2 characters long")
      .test(
        "is-english",
        "Username must be in English. No special characters, either.",
        (value) => {
          return /^[a-zA-Z0-9\s]+$/.test(value);
        },
      )
      .test("unique", "This CAT# is already taken", async (value, context) => {
        if (!value) return true;
        try {
          // Await the debounced function. Note that this won't wait for 2 seconds.
          // It only ensures that calls to this function are debounced
          const isUnique = await debouncedCheckCatNum(token, value);
          console.log(isUnique);
          return isUnique; // Return true if unique, false otherwise
        } catch (error) {
          console.error("Error checking uniqueness", error);
          return context.createError({
            message: "Unable to check uniqueness at the moment",
          });
        }
      }),
    category: yup.string().required("Product category is required"),
    measurementUnit: yup.string().required("Measurement unit is required"),
    volume: yup
      .string()
      .required("Volume is required")
      .matches(/^\d+$/, "Volume must be a number"),
    storageConditions: yup.string().required("Storage condition is required"),
    currentStock: yup
      .string()
      .matches(/^\d+$/, "Current stock must be a number")
      .notRequired(),
    currentPrice: yup.lazy((value) =>
      !isSupplier
        ? yup.string().matches(/^\d+$/, "Current price must be a number")
        : yup.mixed().notRequired(),
    ),
    manufacturer: yup.string().required("Manufacturer is required"),
    supplier: yup.lazy((value) =>
      !isSupplier
        ? yup.string().required("Supplier is required")
        : yup.mixed().notRequired(),
    ),
    productUrl: yup
      .string()
      .url("Enter a valid URL")
      .required("Product link is required"),
  });

const CreateProductModal = ({ onSuccessfulCreate }) => {
  const { token, isSupplier, userDetails } = useContext(AppContext);
  const formSchema = createFormSchema({ token, isSupplier });
  const [manufacturerList, setManufacturerList] = useState(null);
  const [supplierList, setSupplierList] = useState(null);
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    getManufacturerSelectList(token, setManufacturerList).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
    getSupplierSelectList(token, setSupplierList).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, []);

  const handleFileChange = (event) => {
    const allFiles = Array.from(event.target.files);

    const newImages = allFiles.map((file) => ({
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
    setImages([]);
  };

  const handleShow = () => setShowModal(true);

  const handleSubmit = (values) => {
    setErrorMessages([]);

    const formData = new FormData();
    formData.append("name", values.productName);
    formData.append("cat_num", values.catalogueNumber);
    formData.append("category", values.category);
    formData.append("unit", values.measurementUnit);
    formData.append("volume", values.volume);
    formData.append("storage", values.storageConditions);
    formData.append("stock", values.currentStock);
    formData.append("price", values.currentPrice);
    formData.append("url", values.productUrl);
    formData.append("manufacturer", values.manufacturer);
    const supplierValue = isSupplier
      ? userDetails.supplier_id
      : values.supplier;
    formData.append("supplier", supplierValue);
    if (isSupplier) {
      formData.append("supplier_cat_item", true);
    }
    if (images.length) {
      const imageInfo = images.map((image) => ({
        id: image.id,
        type: image.file.type,
      }));
      formData.append("images", JSON.stringify(imageInfo));
    }

    createProduct(token, formData, images).then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulCreate();
          handleClose();
        }, 1500);
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  if (!manufacturerList || !supplierList) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Add Product
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Product</Modal.Title>
        </Modal.Header>

        <Formik
          initialValues={{
            productName: "",
            CatalogueNumber: "",
            category: "",
            measurementUnit: "",
            volume: "",
            storageConditions: "",
            currentStock: "",
            currentPrice: "",
            manufacturer: "",
            supplier: "",
            productLink: "",
            productImages: null,
          }}
          validationSchema={formSchema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {({
            handleSubmit,
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
                    controlId="createProductName"
                    className="field-margin"
                  >
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="productName"
                      value={values.productName}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("productName", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.productName && !!errors.productName}
                      isValid={touched.productName && !errors.productName}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.productName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="createCatalogueNumber"
                    className="field-margin"
                  >
                    <Form.Label>Catalogue Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="catalogueNumber"
                      value={values.catalogueNumber}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("catalogueNumber", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.catalogueNumber && !!errors.catalogueNumber
                      }
                      isValid={
                        touched.catalogueNumber && !errors.catalogueNumber
                      }
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.catalogueNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="createProductCatgeory"
                    className="field-margin"
                  >
                    <Form.Label>Product Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        --Select product category--
                      </option>
                      {PRODUCT_CATEGORIES.map((choice, index) => (
                        <option key={index} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.category}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="createProductUnit"
                    className="field-margin"
                  >
                    <Form.Label>Measurement Unit</Form.Label>
                    <Form.Select
                      name="measurementUnit"
                      value={values.measurementUnit}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        --Select measurement unit--
                      </option>
                      {PRODUCT_MEASUREMENT_UNITS.map((choice, index) => (
                        <option key={index} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.measurementUnit}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="createProductVolume"
                    className="field-margin"
                  >
                    <Form.Label>Volume</Form.Label>
                    <Form.Control
                      type="text"
                      name="volume"
                      value={values.volume}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("volume", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.volume && !!errors.volume}
                      isValid={touched.volume && !errors.volume}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.volume}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="createProductStorage"
                    className="field-margin"
                  >
                    <Form.Label>Storage Conditions</Form.Label>
                    <Form.Select
                      name="storageConditions"
                      value={values.storageConditions}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        --Select storage condition--
                      </option>
                      {PRODUCT_STORAGE_OPTIONS.map((choice, index) => (
                        <option key={index} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.storageConditions}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="createProductStock"
                    className="field-margin"
                  >
                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                      type="text"
                      name="currentStock"
                      value={values.currentStock}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("currentStock", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.currentStock &&
                        values.currentStock &&
                        !!errors.currentStock
                      }
                      isValid={
                        touched.currentStock &&
                        values.currentStock &&
                        !errors.currentStock
                      }
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.currentStock}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="createProductPrice"
                    className="field-margin"
                  >
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="text"
                      name="currentPrice"
                      value={values.currentPrice}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("currentPrice", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.currentPrice &&
                        values.volume &&
                        !!errors.currentPrice
                      }
                      isValid={
                        touched.currentPrice &&
                        values.volume &&
                        !errors.currentPrice
                      }
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.currentPrice}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="createProductManufacturer"
                    className="field-margin"
                  >
                    <Form.Label>Manufacturer</Form.Label>
                    <Form.Select
                      name="manufacturer"
                      value={values.manufacturer}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        --Select Manufacturer--
                      </option>
                      {manufacturerList.map((choice, index) => (
                        <option key={index} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.manufacturer}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="createProductSupplier"
                    className="field-margin"
                  >
                    <Form.Label>Supplier</Form.Label>
                    <Form.Select
                      name="supplier"
                      value={values.supplier}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        --Select Supplier--
                      </option>
                      {supplierList.map((choice, index) => (
                        <option key={index} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.supplier}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="createProductUrl"
                    className="field-margin"
                  >
                    <Form.Label>Product Link</Form.Label>
                    <Form.Control
                      type="text"
                      name="productUrl"
                      value={values.productUrl}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("productLink", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.productUrl && !!errors.productUrl}
                      isValid={touched.productUrl && !errors.productUrl}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.productUrl}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <div className="field-margin">
                    {images.map((image) => {
                      let imageUrl =
                        image.image || URL.createObjectURL(image.file);
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
                              alt={`product-${values.catalogueNumber}-image-${image.id}`}
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
                  <Form.Group
                    controlId="createProductUrl"
                    className="field-margin"
                  >
                    <Form.Label>
                      Upload Product Images (jpg, png, gif)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      title="Accepted formats: jpg, png, gif"
                      name="productImages"
                      onChange={(event) => {
                        handleFileChange(event);
                        const files = event.currentTarget.files;
                        setFieldValue(
                          "productImages",
                          files.length ? files : null,
                        );
                      }}
                      isValid={values.productImages}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                  </Form.Group>
                  {errorMessages.length > 0 && (
                    <ul>
                      {errorMessages.map((error, id) => (
                        <li key={id} className="text-danger fw-bold">
                          {error}
                        </li>
                      ))}
                    </ul>
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
                    Create
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
export default CreateProductModal;
