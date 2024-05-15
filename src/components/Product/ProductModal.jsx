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
import { PencilFill } from "react-bootstrap-icons";
import { showToast } from "../../config_and_helpers/helpers";

/**
 * Creates a Yup schema for product form validation based on whether the current user is a supplier or not.
 * Checks that all required fields have been filled in correctly.
 *
 * @function createFormSchema
 * @param {Object} params - The parameters that define the schema.
 * @param {boolean} params.isSupplier - A boolean value that tells whether the currently logged-in user is a supplier.
 * @returns {yup.ObjectSchema} The schema to enforce on the product form.
 */
const createFormSchema = ({ isSupplier }) =>
  yup.object().shape({
    productName: yup
      .string()
      .required("Product name is required")
      .min(2, "Product name must be at least 2 characters long"),
    catalogueNumber: yup
      .string()
      .required("Catalogue number is required")
      .min(2, "Catalogue number must be at least 2 characters long")
      .test(
        "is-english",
        "CAT# must be made of English letters and numbers.",
        (value) => {
          return /^[a-zA-Z0-9\-_. ]+$/.test(value);
        },
      ),
    category: yup.string().required("Product category is required"),
    unit: yup.string().required("Measurement unit is required"),
    unitQuantity: yup
      .string()
      .required("Unit volume/quantity is required")
      .matches(
        /^\d+(\.\d*)?$/,
        "Unit volume/quantity must be a positive number",
      ),
    unitsPerSubUnit: yup
      .string()
      .matches(
        /^\d+(\.\d*)?$/,
        "Unit volume/quantity must be a positive number",
      ),
    storageConditions: yup.string().required("Storage condition is required"),
    location: yup.string(),
    stock: yup
      .string()
      .matches(/^\d+$/, "Current stock must be a positive number")
      .notRequired(),
    price: yup.lazy((value) =>
      !isSupplier
        ? yup
            .string()
            .matches(/^\d+(\.\d*)?$/, "Current price must be a valid number")
        : yup.mixed().notRequired(),
    ),
    supplier: yup.lazy((value) =>
      !isSupplier
        ? yup.string().required("Supplier is required")
        : yup.mixed().notRequired(),
    ),
    productUrl: yup.string().url("Enter a valid URL"),
  });

/**
 * Renders a modal that allows the user to create a new product or edit the details of an existing product.
 * Integrated with validation, which works based on the Yup scheme.
 *
 * @component
 * @param {Object} props - The properties that define the ProductModal.
 * @param {Function} props.onSuccessfulSubmit - A callback function that is called when a product is successfully created or updated.
 * @param {Object} props.productObj - An object containing the product's information.
 * @param {boolean} props.homeShowModal - A boolean value that determines whether the modal is visible initially.
 * @param {Function} props.setHomeShowModal - A function to update the state of homeShowModal.
 *
 * @example
 * // Importing the component
 * import ProductModal from './ProductModal';
 * // Here is how to use this component
 * const onSuccessfulSubmit = () => console.log('Product was successfully created or updated');
 * const productObj = {
 *  name: 'Example',
 *  cat_num: 'EX123',
 *  // And the rest of the required properties
 * };
 * const homeShowModal = false;
 * const setHomeShowModal = (value) => console.log(value);
 * <ProductModal onSuccessfulSubmit={onSuccessfulSubmit} productObj={productObj} homeShowModal={homeShowModal} setHomeShowModal={setHomeShowModal} />
 *
 * @returns {React.Element} The rendered ProductModal component.
 */
const ProductModal = ({
  onSuccessfulSubmit,
  productObj,
  homeShowModal,
  setHomeShowModal,
}) => {
  // Retrieves context values including the authentication token and user role information.
  const { token, isSupplier, userDetails } = useContext(AppContext);
  // Generates a form validation schema based on the user's role (isSupplier). This schema is used to validate the product form inputs.
  const formSchema = createFormSchema({
    isSupplier,
  });
  // Indicates whether the Catalogue Number (CAT#) entered is unique. Initialized as `true` by default.
  const [isCatNumUnique, setIsCatNumUnique] = useState(true);
  // Stores the value of Catalogue Number (CAT#). Initialized as empty string by default.
  const [catalogueNumber, setCatalogueNumber] = useState("");
  // Indicates whether the system is in the process of checking for the uniqueness of the Catalogue Number (CAT#). Initialized as `false` by default.
  const [isCheckingCatNum, setIsCheckingCatNum] = useState(false);
  // Stores the list of available manufacturers retrieved from the backend. Initialized as `null` by default.
  const [manufacturerList, setManufacturerList] = useState(null);
  // Stores the list of available suppliers retrieved from the backend. Initialized as `null` by default.
  const [supplierList, setSupplierList] = useState(null);
  // Stores the Supplier ID for fetching  the filtered manufacturers accordingly
  const [supplierId, setSupplierId] = useState(
    productObj ? productObj.supplier : "",
  );
  /* Stores the images related to the product.
    If the product object is provided, it stores the images of the product, otherwise, an empty array is used as default. */
  const [images, setImages] = useState(productObj ? productObj.images : []);
  /* Controls whether the ProductModal is displayed or not.
    If the homeShowModal is provided, it uses the value otherwise default to `false`. */
  const [showModal, setShowModal] = useState(
    homeShowModal ? homeShowModal : false,
  );
  // Indicates whether the form is being submitted or not. Initialized as `false` by default.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect hook to initialize the supplier list
  useEffect(() => {
    getSupplierSelectList(token, setSupplierList); // Fetches the supplier list.
  }, []);

  // useEffect hook to fetch the filtered manufacturer list related to the selected supplier
  useEffect(() => {
    getManufacturerSelectList(token, setManufacturerList);
  }, []);

  // Object for validating the uniqueness of the catalogue number.
  // It contains an id, error text, and a validation function.
  const catalogueNumberUniqueValidator = {
    id: "unique", // Identifier for this specific validator.
    text: "This CAT# is already taken.", // Error message displayed if validation fails.
    validate: () => (isCheckingCatNum ? true : isCatNumUnique), // Validation logic.
  };

  // useEffect hook for setting images when the product object changes.
  // The dependency array contains 'productObj', so this effect will rerun every time 'productObj' changes.
  useEffect(() => {
    if (productObj) {
      setImages(productObj.images); // Updates the state with the new images from the product object.
    }
  }, [productObj]);

  // Async function for validating the catalogue number.
  // Checks if the given catalogue number is unique.
  const validateCatNum = async (value) => {
    const response = await checkCatNum(token, value); // Calls API to validate catalogue number.
    setIsCheckingCatNum(false); // Sets state to indicate checking is complete.
    setIsCatNumUnique(response); // Sets state based on the API response.
  };

  // Debounced function for catalogue number validation.
  // Debouncing prevents the validateCatNum function from being called too frequently.
  // This is useful for operations like real-time validation where you don't want to overload the server with requests.
  const debouncedCheckCatNum = useCallback(debounce(validateCatNum, 1500), []);

  // useEffect hook for debouncing catalogue number validation.
  // It's triggered when 'catalogueNumber' or 'debouncedCheckCatNum' changes.
  // This effect manages the logic for when to trigger the catalogue number validation.
  useEffect(() => {
    if (catalogueNumber && catalogueNumber !== productObj?.cat_num) {
      debouncedCheckCatNum(catalogueNumber); // Validates the new catalogue number after debounce period.
    } else {
      setIsCheckingCatNum(false); // Resets the checking state if conditions are not met.
    }
  }, [catalogueNumber, debouncedCheckCatNum]);

  // Function to handle file changes (typically from an input element).
  // It processes the selected files and updates the 'images' state.
  const handleFileChange = (files) => {
    // Maps each file to an object containing the file and a temporary unique ID.
    // The ID is generated using the current timestamp and a random number to ensure uniqueness.
    const newImages = files.map((file) => ({
      file,
      id: `temp-${Date.now()}-${Math.random()}`,
    }));

    // Updates the 'images' state by adding the new images to the existing ones.
    setImages((prevState) => [...prevState, ...newImages]);
  };

  // Function to handle the deletion of an image.
  // It takes the ID of the image to be deleted and updates the 'images' state.
  function handleDeleteImage(imageId) {
    // Filters out the image with the specified ID and updates the state.
    // This effectively removes the image from the UI.
    setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
  }

  // Function to handle the closing of the modal.
  // It resets the state related to the modal and images.
  const handleClose = () => {
    setShowModal(false); // Closes the modal by setting the state to false.
    // Optionally closes another modal (e.g., a parent or related modal) if required.
    if (setHomeShowModal) setHomeShowModal(false);
    // Resets the 'images' state to the initial images of the product object,
    // or to an empty array if no product object is present.
    setImages(productObj ? productObj.images : []);
  };

  // Function to handle the action to show the modal.
  // It simply sets the 'showModal' state to true, which is typically used to render the modal.
  const handleShow = () => setShowModal(true);

  // Function to handle the submission of the product form.
  // It processes the form values, manages image data, and sends the data to the server.
  const handleSubmit = (values) => {
    setIsSubmitting(true); // Sets a flag indicating that the form is currently being submitted.

    let imagesToDelete = null; // Initializes a variable to track images that need to be deleted.

    // Constructs the product data object from the form values.
    const productData = {
      name: values.productName,
      cat_num: values.catalogueNumber,
      category: values.category,
      unit: values.unit,
      unit_quantity: values.unitQuantity,
      units_per_sub_unit: values.unitsPerSubUnit,
      storage: values.storageConditions,
      location: values.location,
      stock: values.stock,
      price: values.price,
      currency: values.currency,
      url: values.productUrl,
      manufacturer: values.manufacturer,
    };

    // Sets the supplier ID based on whether the user is a supplier or not.
    productData.supplier = isSupplier
      ? userDetails.supplier_id
      : values.supplier;

    // Flags the product as a supplier catalog item if the user is a supplier.
    productData.supplier_cat_item = !!isSupplier;

    // If updating an existing product, identifies which images to delete.
    if (productObj) {
      imagesToDelete = productObj.images
        .filter((obj1) => !images.some((obj2) => obj1.id === obj2.id))
        .map((obj) => obj.id);
      if (imagesToDelete) {
        productData.images_to_delete = imagesToDelete;
      }
    }

    // Filters for new images and prepares their data for submission.
    const newImages = images.filter((image) => image.file);
    if (newImages.length) {
      const imageInfo = newImages.map((image) => ({
        id: image.id,
        type: image.file.type,
      }));
      productData.images = JSON.stringify(imageInfo);
    }

    // Chooses between updating or creating a product based on the existence of 'productObj'.
    const productPromise = productObj
      ? updateProduct(token, productObj.id, productData, newImages)
      : createProduct(token, productData, newImages);

    // Handles the response from the product creation or update request.
    productPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          // Callback function on successful submission.
          if (onSuccessfulSubmit) onSuccessfulSubmit();
          response.toast(); // Triggers a success toast message.
          setIsSubmitting(false); // Resets the submitting state.
          handleClose(); // Closes the modal.
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
    <>
      {/* Conditional rendering of the button based on 'homeShowModal' state.
      Displays an edit button if 'productObj' exists, otherwise a create button. */}
      {!homeShowModal && (
        <Button
          variant={productObj ? "outline-success" : "success"}
          onClick={handleShow}
        >
          {productObj ? <PencilFill /> : "Create Product"}
        </Button>
      )}

      {/* Modal component that displays the form for creating or editing a product. */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{productObj ? "Edit" : "Create"} Product</Modal.Title>
        </Modal.Header>

        {/* Formik component for form management, including validation and submission. */}
        <Formik
          initialValues={{
            // Initial values are set based on 'productObj' if editing, otherwise they're empty.
            productName: productObj ? productObj.name : "",
            catalogueNumber: productObj ? productObj.cat_num : "",
            category: productObj ? productObj.category : "",
            unit: productObj ? productObj.unit : "",
            unitQuantity: productObj ? productObj.unit_quantity : "",
            unitsPerSubUnit:
              productObj && productObj?.units_per_sub_unit !== null
                ? productObj?.units_per_sub_unit
                : "",
            storageConditions: productObj ? productObj.storage : "",
            location: productObj ? productObj.location : "",
            stock: productObj ? productObj.stock : "",
            price:
              productObj && productObj?.price !== null ? productObj.price : "",
            currency:
              productObj && productObj?.currency !== null
                ? productObj.currency
                : "",
            manufacturer:
              productObj && productObj?.manufacturer !== null
                ? productObj?.manufacturer
                : "",
            supplier: productObj ? productObj.supplier : "",
            productUrl: productObj ? productObj.url : "",
            productImages: null,
          }}
          validationSchema={formSchema} // Validation schema for the form fields.
          onSubmit={(values) => {
            handleSubmit(values); // Submission handler for the form.
          }}
          // Sets which fields are initially touched if editing an existing product.
          initialTouched={
            productObj
              ? {
                  productName: true,
                  catalogueNumber: true,
                  category: true,
                  unit: true,
                  unitQuantity: true,
                  storageConditions: true,
                  location: true,
                  stock: true,
                  price: true,
                  currency: true,
                  manufacturer: true,
                  supplier: true,
                  productUrl: true,
                  productImages: true,
                }
              : {}
          }
          validateOnMount={!!productObj} // Enables validation on mount for editing.
          enableReinitialize={true} // Allows reinitializing values when 'productObj' changes.
        >
          {/* Form rendering and handling logic. */}
          {({
            // Destructuring various helpers and states provided by Formik.
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
                  {/* Form groups for various product attributes. */}
                  {/* Each group handles its own validation and display logic. */}
                  <Form.Group
                    controlId="formProductName"
                    className="field-margin"
                  >
                    <Form.Label>Product Name</Form.Label>
                    {/* Input for product name with validation feedback. */}
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
                    {/* Feedback for valid or invalid input. */}
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
                    {/* Input for catalogue number with validation feedback. */}
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
                    {/* Feedback for valid or invalid input. */}
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
                    {/* Input for product category with validation feedback. */}
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
                    {/* Feedback for valid or invalid input. */}
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
                    {/* Input for measurement unit with validation feedback. */}
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
                    {/* Feedback for valid or invalid input. */}
                    <Form.Control.Feedback type="invalid">
                      {errors.unit}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="formProductUnitQuantity"
                    className="field-margin"
                  >
                    <Form.Label>Volume / Quantity</Form.Label>
                    {/* Input for unit quantity with validation feedback. */}
                    <Form.Control
                      type="text"
                      name="unitQuantity"
                      value={values.unitQuantity}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("unitQuantity", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.unitQuantity && !!errors.unitQuantity}
                      isValid={touched.unitQuantity && !errors.unitQuantity}
                    />
                    {/* Feedback for valid or invalid input. */}
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.unitQuantity}
                    </Form.Control.Feedback>
                  </Form.Group>
                  {values.unit === "Box" || values.unit === "Package" ? (
                    <Form.Group
                      controlId="formProductUnitsPerSubUnit"
                      className="field-margin"
                    >
                      <Form.Label>Units Per Sub Unit</Form.Label>
                      {/* Input for unit quantity with validation feedback. */}
                      <Form.Control
                        type="text"
                        name="unitsPerSubUnit"
                        value={values.unitsPerSubUnit}
                        onChange={handleChange}
                        onFocus={() => setFieldTouched("unitsPerSubUnit", true)}
                        onBlur={handleBlur}
                        isInvalid={
                          touched.unitsPerSubUnit && !!errors.unitsPerSubUnit
                        }
                        isValid={
                          touched.unitsPerSubUnit && !errors.unitsPerSubUnit
                        }
                      />
                      {/* Feedback for valid or invalid input. */}
                      <Form.Control.Feedback type="valid">
                        Looks good!
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        {errors.unitsPerSubUnit}
                      </Form.Control.Feedback>
                    </Form.Group>
                  ) : null}
                  <Form.Group
                    as={Col}
                    md="8"
                    controlId="formProductStorage"
                    className="field-margin"
                  >
                    <Form.Label>Storage Conditions</Form.Label>
                    {/* Input for storage condition with validation feedback. */}
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
                    {/* Feedback for valid or invalid input. */}
                    <Form.Control.Feedback type="invalid">
                      {errors.storageConditions}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="formProductLocation"
                    className="field-margin"
                  >
                    <Form.Label>Location</Form.Label>
                    {/* Input for existing stock with validation feedback. */}
                    <Form.Control
                      type="text"
                      name="location"
                      value={values.location}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("location", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.location && values.stock && !!errors.location
                      }
                      isValid={
                        touched.location && values.stock && !errors.location
                      }
                    />
                    {/* Feedback for valid or invalid input. */}
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="formProductStock"
                    className="field-margin"
                  >
                    <Form.Label>Stock</Form.Label>
                    {/* Input for existing stock with validation feedback. */}
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
                    {/* Feedback for valid or invalid input. */}
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
                    {/* Input for price with validation feedback. */}
                    <Form.Control
                      type="text"
                      name="price"
                      value={values.price}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("price", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.price && values.price && !!errors.price
                      }
                      isValid={touched.price && values.price && !errors.price}
                    />
                    {/* Feedback for valid or invalid input. */}
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
                    controlId="formProductUnit"
                    className="field-margin"
                  >
                    <Form.Label>Currency</Form.Label>
                    {/* Input for measurement unit with validation feedback. */}
                    <Form.Select
                      name="currency"
                      value={values.currency}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        --Select currency--
                      </option>
                      <option value="NIS">NIS</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </Form.Select>
                    {/* Feedback for valid or invalid input. */}
                    <Form.Control.Feedback type="invalid">
                      {errors.currency}
                    </Form.Control.Feedback>
                  </Form.Group>
                  {!isSupplier && supplierList && (
                    <>
                      <Form.Group
                        as={Col}
                        md="8"
                        controlId="formProductSupplier"
                        className="field-margin"
                      >
                        <Form.Label>Supplier</Form.Label>
                        {/* Input for supplier with validation feedback. */}
                        <Form.Select
                          name="supplier"
                          value={values.supplier}
                          onChange={(event) => {
                            const supplierId = event.target.value;
                            handleChange(event);
                            setSupplierId(supplierId);
                          }}
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
                        {/* Feedback for valid or invalid input. */}
                        <Form.Control.Feedback type="invalid">
                          {errors.supplier}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </>
                  )}

                  {manufacturerList && (
                    <Form.Group
                      as={Col}
                      md="8"
                      controlId="formProductManufacturer"
                      className="field-margin"
                    >
                      <Form.Label>Manufacturer</Form.Label>
                      {/* Input for manufacturer with validation feedback. */}
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
                      {/* Feedback for valid or invalid input. */}
                      <Form.Control.Feedback type="invalid">
                        {errors.manufacturer}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}

                  <Form.Group
                    controlId="formProductUrl"
                    className="field-margin"
                  >
                    <Form.Label>Product Link</Form.Label>
                    {/* Input for product link with validation feedback. */}
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
                    {/* Feedback for valid or invalid input. */}
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.productUrl}
                    </Form.Control.Feedback>
                  </Form.Group>
                  {/* Dynamic rendering of product images. */}
                  <div className="field-margin">
                    {images.map((image) => {
                      // Determines the URL for each image and checks if it's a PDF.
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
                  {/* Upload field for product images. */}
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
                    {/* Feedback for valid or invalid input. */}
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  {/* Conditional rendering of a spinner or submit button based on submission state. */}
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
