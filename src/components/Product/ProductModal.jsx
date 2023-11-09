import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_MEASUREMENT_UNITS,
  PRODUCT_STORAGE_OPTIONS,
} from "../../config_and_helpers/config";
import { AppContext } from "../../App";
import {
  checkCatNum,
  createProduct,
  updateProduct,
} from "../../clients/product_client";
import { getManufacturerSelectList } from "../../clients/manufacturer_client";
import { getSupplierSelectList } from "../../clients/supplier_client";
import * as yup from "yup";
import { Formik } from "formik";
import { Col, Form } from "react-bootstrap";
import "./ProductComponentStyle.css";
import "font-awesome/css/font-awesome.min.css";
import DeleteIcon from "@mui/icons-material/Delete";
import debounce from "lodash/debounce";

const createFormSchema = ({ isSupplier }) =>
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
      ),
    category: yup.string().required("Product category is required"),
    measurementUnit: yup.string().required("Measurement unit is required"),
    volume: yup
      .string()
      .required("Volume is required")
      .matches(/^\d+$/, "Volume must be a number"),
    storageConditions: yup.string().required("Storage condition is required"),
    stock: yup
      .string()
      .matches(/^\d+$/, "Current stock must be a number")
      .notRequired(),
    price: yup.lazy((value) =>
      !isSupplier
        ? yup
            .string()
            .matches(/^\d+(\.\d+)?$/, "Current price must be a valid number")
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

const ProductModal = ({ onSuccessfulSubmit, productObj }) => {
  const { token, isSupplier, userDetails } = useContext(AppContext);
  const formSchema = createFormSchema({
    isSupplier,
  });
  const [isCatNumUnique, setIsCatNumUnique] = useState(true);
  const [catalogueNumber, setCatalogueNumber] = useState("");
  const [isCheckingCatNum, setIsCheckingCatNum] = useState(false);
  const [manufacturerList, setManufacturerList] = useState(null);
  const [supplierList, setSupplierList] = useState(null);
  const [images, setImages] = useState(productObj ? productObj.images : []);
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

  const catalogueNumberUniqueValidator = {
    id: "unique",
    text: "This CAT# is already taken.",
    validate: () => (isCheckingCatNum ? true : isCatNumUnique),
  };

  useEffect(() => {
    if (productObj) {
      setImages(productObj.images);
    }
  }, [productObj]);

  const validateCatNum = async (value) => {
    const response = await checkCatNum(token, value);
    setIsCheckingCatNum(false);
    setIsCatNumUnique(response);
  };

  const debouncedCheckCatNum = useCallback(debounce(validateCatNum, 1500), []);

  useEffect(() => {
    if (
      catalogueNumber &&
      productObj &&
      catalogueNumber !== productObj.cat_num
    ) {
      debouncedCheckCatNum(catalogueNumber);
    } else {
      setIsCheckingCatNum(false);
    }
  }, [catalogueNumber, debouncedCheckCatNum]);

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
    setImages(productObj ? productObj.images : []);
  };

  const handleShow = () => setShowModal(true);

  const handleSubmit = (values) => {
    setErrorMessages([]);
    let imagesToDelete = null;

    const formData = new FormData();
    formData.append("name", values.productName);
    formData.append("cat_num", values.catalogueNumber);
    formData.append("category", values.category);
    formData.append("unit", values.measurementUnit);
    formData.append("volume", values.volume);
    formData.append("storage", values.storageConditions);
    formData.append("stock", values.stock);
    formData.append("price", values.price);
    formData.append("url", values.productUrl);
    formData.append("manufacturer", values.manufacturer);

    const supplierValue = isSupplier
      ? userDetails.supplier_id
      : values.supplier;
    formData.append("supplier", supplierValue);

    if (isSupplier) {
      formData.append("supplier_cat_item", true);
    }

    if (productObj) {
      imagesToDelete = productObj.images
        .filter((obj1) => !images.some((obj2) => obj1.id === obj2.id))
        .map((obj) => obj.id);
      if (imagesToDelete) {
        formData.append("images_to_delete", imagesToDelete);
      }
    }

    const newImages = images.filter((image) => image.file);

    if (newImages.length) {
      const imageInfo = newImages.map((image) => ({
        id: image.id,
        type: image.file.type,
      }));
      formData.append("images", JSON.stringify(imageInfo));
    }

    const productPromise =
      productObj !== null
        ? updateProduct(token, productObj.id, formData, newImages)
        : createProduct(token, formData, newImages);

    productPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulSubmit();
          handleClose();
        }, 2500);
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
        {productObj ? "Edit" : "Create"} Product
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{[productObj] ? "Edit" : "Create"} Product</Modal.Title>
        </Modal.Header>

        <Formik
          initialValues={{
            productName: productObj ? productObj.name : "",
            catalogueNumber: productObj ? productObj.cat_num : "",
            category: productObj ? productObj.category : "",
            measurementUnit: productObj ? productObj.unit : "",
            volume: productObj ? productObj.volume : "",
            storageConditions: productObj ? productObj.storage : "",
            stock: productObj ? productObj.stock : "",
            price: productObj ? productObj.price : "",
            manufacturer: productObj ? productObj.manufacturer.name : "",
            supplier: productObj ? productObj.supplier.name : "",
            productUrl: productObj ? productObj.url : "",
            productImages: null,
          }}
          validationSchema={formSchema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
          initialTouched={
            productObj
              ? {
                  productName: true,
                  catalogueNumber: true,
                  category: true,
                  measurementUnit: true,
                  volume: true,
                  storageConditions: true,
                  stock: true,
                  price: true,
                  manufacturer: true,
                  supplier: true,
                  productUrl: true,
                  productImages: true,
                }
              : {}
          }
          validateOnMount={!!productObj}
          enableReinitialize={true}
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
              <Form id="productForm" noValidate onSubmit={handleSubmit}>
                <Modal.Body className="d-flex flex-column p-4">
                  <Form.Group
                    controlId="formProductName"
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
                    controlId="formCatalogueNumber"
                    className="field-margin"
                  >
                    <Form.Label>Catalogue Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="catalogueNumber"
                      value={values.catalogueNumber}
                      onChange={(event) => {
                        const { value } = event.target;
                        setIsCheckingCatNum(true);
                        setCatalogueNumber(value);
                        setFieldValue("catalogueNumber", value);
                      }}
                      onFocus={() => setFieldTouched("catalogueNumber", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.catalogueNumber && !!errors.catalogueNumber) ||
                        !catalogueNumberUniqueValidator.validate()
                      }
                      isValid={
                        touched.catalogueNumber &&
                        !errors.catalogueNumber &&
                        catalogueNumberUniqueValidator.validate() &&
                        !isCheckingCatNum
                      }
                    />
                    {catalogueNumberUniqueValidator.validate() &&
                      !isCheckingCatNum && (
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                      )}
                    <Form.Control.Feedback type="invalid">
                      {errors.catalogueNumber}
                      {!catalogueNumberUniqueValidator.validate() &&
                        !isCheckingCatNum &&
                        catalogueNumberUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingCatNum && <Form.Text>Checking...</Form.Text>}
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="formProductCatgeory"
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
                    controlId="formProductUnit"
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
                    controlId="formProductVolume"
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
                    controlId="formProductStorage"
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
                    controlId="formProductStock"
                    className="field-margin"
                  >
                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                      type="text"
                      name="stock"
                      value={values.stock}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("stock", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.stock && values.stock && !!errors.stock
                      }
                      isValid={touched.stock && values.stock && !errors.stock}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.stock}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="formProductPrice"
                    className="field-margin"
                  >
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="text"
                      name="price"
                      value={values.price}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("price", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.price && values.volume && !!errors.price
                      }
                      isValid={touched.price && values.volume && !errors.price}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.price}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="formProductManufacturer"
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
                    controlId="formProductSupplier"
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
                    controlId="formProductUrl"
                    className="field-margin"
                  >
                    <Form.Label>Product Link</Form.Label>
                    <Form.Control
                      type="text"
                      name="productUrl"
                      value={values.productUrl}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("productUrl", true)}
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
                        image.image_url || URL.createObjectURL(image.file);
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
                    controlId="formProductImages"
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
                        const files = Array.from(event.target.files);
                        handleFileChange(files);
                        setFieldValue(
                          "productImages",
                          files.length ? files : null,
                        );
                      }}
                      isValid={values.productImages || images.length}
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
                    disabled={
                      !isValid ||
                      !catalogueNumberUniqueValidator.validate() ||
                      isCheckingCatNum ||
                      (!productObj && !dirty)
                    }
                    onClick={handleSubmit}
                  >
                    {productObj ? "Save" : "Create"}
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
export default ProductModal;
