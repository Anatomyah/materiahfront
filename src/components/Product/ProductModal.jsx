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
import { Col, Form, Spinner } from "react-bootstrap";
import "./ProductComponentStyle.css";
import "font-awesome/css/font-awesome.min.css";
import DeleteIcon from "@mui/icons-material/Delete";
import debounce from "lodash/debounce";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EditIcon from "@mui/icons-material/Edit";
import { showToast } from "../../config_and_helpers/helpers";

const createFormSchema = ({ isSupplier }) =>
  yup.object().shape({
    productName: yup
      .string()
      .required("Product name is required")
      .min(2, "Product name must be at least 2 characters long")
      .test("is-english", "Username must be in English.", (value) => {
        return /^[a-zA-Z0-9\-_ ]+$/.test(value);
      }),
    catalogueNumber: yup
      .string()
      .required("Catalogue number is required")
      .min(2, "Catalogue number must be at least 2 characters long")
      .test("is-english", "Username must be in English.", (value) => {
        return /^[a-zA-Z0-9\-_ ]+$/.test(value);
      }),
    category: yup.string().required("Product category is required"),
    unit: yup.string().required("Measurement unit is required"),
    volume: yup
      .string()
      .required("Volume is required")
      .matches(/^\d+$/, "Volume must be a positive number"),
    storageConditions: yup.string().required("Storage condition is required"),
    stock: yup
      .string()
      .matches(/^\d+$/, "Current stock must be a positive number")
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

const ProductModal = ({
  onSuccessfulSubmit,
  productObj,
  homeShowModal,
  setHomeShowModal,
}) => {
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
  const [showModal, setShowModal] = useState(
    homeShowModal ? homeShowModal : false,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getManufacturerSelectList(token, setManufacturerList);
    getSupplierSelectList(token, setSupplierList);
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
    if (catalogueNumber && catalogueNumber !== productObj?.cat_num) {
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
    setShowModal(false);
    if (setHomeShowModal) setHomeShowModal(false);
    setImages(productObj ? productObj.images : []);
  };

  const handleShow = () => setShowModal(true);

  const handleSubmit = (values) => {
    setIsSubmitting(true);
    let imagesToDelete = null;

    const productData = {
      name: values.productName,
      cat_num: values.catalogueNumber,
      category: values.category,
      unit: values.unit,
      volume: values.volume,
      storage: values.storageConditions,
      stock: values.stock,
      price: values.price,
      url: values.productUrl,
      manufacturer: values.manufacturer,
    };

    productData.supplier = isSupplier
      ? userDetails.supplier_id
      : values.supplier;

    if (isSupplier) {
      productData.supplier_cat_item = true;
    }

    if (productObj) {
      imagesToDelete = productObj.images
        .filter((obj1) => !images.some((obj2) => obj1.id === obj2.id))
        .map((obj) => obj.id);
      if (imagesToDelete) {
        productData.images_to_delete = imagesToDelete;
      }
    }

    const newImages = images.filter((image) => image.file);

    if (newImages.length) {
      const imageInfo = newImages.map((image) => ({
        id: image.id,
        type: image.file.type,
      }));
      productData.images = JSON.stringify(imageInfo);
    }

    const productPromise = productObj
      ? updateProduct(token, productObj.id, productData, newImages)
      : createProduct(token, productData, newImages);

    productPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          if (onSuccessfulSubmit) onSuccessfulSubmit();
          response.toast();
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

  if (!manufacturerList || !supplierList) {
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
          variant={productObj ? "outline-success" : "success"}
          onClick={handleShow}
        >
          {productObj ? <EditIcon /> : "Create Product"}
        </Button>
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{productObj ? "Edit" : "Create"} Product</Modal.Title>
        </Modal.Header>

        <Formik
          initialValues={{
            productName: productObj ? productObj.name : "",
            catalogueNumber: productObj ? productObj.cat_num : "",
            category: productObj ? productObj.category : "",
            unit: productObj ? productObj.unit : "",
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
                  unit: true,
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
                      name="unit"
                      value={values.unit}
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
                      {errors.unit}
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

                      const isPdf = imageUrl.toLowerCase().endsWith(".pdf");

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
                                onClick={() => handleDeleteImage(image.id)}
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
                                onClick={() => handleDeleteImage(image.id)}
                                style={{ cursor: "pointer" }}
                              />
                            </>
                          )}
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
                      disabled={
                        !isValid ||
                        !catalogueNumberUniqueValidator.validate() ||
                        isCheckingCatNum ||
                        (!productObj && !dirty)
                      }
                      type="submit"
                    >
                      {productObj ? "Save" : "Create"}
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
export default ProductModal;
