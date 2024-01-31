import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import DropdownMultiselect from "../Generic/DropdownMultiselect";
import { getSupplierSelectList } from "../../clients/supplier_client";
import {
  checkManufacturerName,
  createManufacturer,
  updateManufacturer,
} from "../../clients/manufacturer_client";
import * as yup from "yup";
import { Formik } from "formik";
import { Form, Spinner } from "react-bootstrap";
import debounce from "lodash/debounce";
import "./ManufacturerComponentStyle.css";
import EditIcon from "@mui/icons-material/Edit";
import { showToast } from "../../config_and_helpers/helpers";

/**
 * formSchema Yup Validation Schema
 *
 * A Yup validation schema for a form used to create or edit a manufacturer.
 * The form includes the fields 'name' and 'websiteUrl', each having its own validation.
 *
 * 'name' field: A string that is required. An error message "Supplier name is required" is shown if it is missing.
 * 'websiteUrl' field: A URL string that is required. An error message "Website is required" is shown if it is missing, and "Enter a valid URL" if URL is not valid.
 *
 * @type {Yup.object}
 */
const formSchema = yup.object().shape({
  name: yup.string().required("Supplier name is required"),
  websiteUrl: yup
    .string()
    .required("Website is required")
    .url("Enter a valid URL"),
});

/**
 * ManufacturerModal Component.
 *
 * This is a form component, contained within a modal, for creating or editing a manufacturer.
 * The form contains fields for the manufacturer's name, website, and associated suppliers.
 * When the form is submitted, a create or update request is sent to the server.
 * The form fields are validated using Yup and Formik.
 * For the manufacturer's name, a uniqueness check is also done through an API request.
 *
 * @component
 *
 * @prop {Function} onSuccessfulSubmit - Function to call when manufacturer creation or update is successfully completed.
 * @prop {object} manufacturerObj - The current manufacturer data; if present, the form becomes an edit form for this manufacturer.
 *
 * @example
 *
 * const onSuccessfulSubmit = () => {
 *   <Insert necessary actions in case of successful form submission>
 * };
 * const manufacturerObj = {
 *   name: 'Manufacturer',
 *   website: 'www.example.com',
 *   suppliers: [<Insert supplier data here>],
 * };
 *
 * return (
 *   <ManufacturerModal
 *     onSuccessfulSubmit={onSuccessfulSubmit}
 *     manufacturerObj={manufacturerObj}
 *   />
 * );
 *
 */
const ManufacturerModal = ({ onSuccessfulSubmit, manufacturerObj }) => {
  // The user's auth token from context
  const { token } = useContext(AppContext);
  // State for selected related suppliers; initialized from the manufacturerObj prop, if present
  const [relatedSuppliers, setRelatedSuppliers] = useState(
    manufacturerObj
      ? manufacturerObj.suppliers.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      : [],
  );
  // State for the list of all suppliers for the multi-select dropdown
  const [supplierList, setSupplierList] = useState([]);
  // State for the entered manufacturer name; initialized from the manufacturerObj prop, if present
  const [name, setName] = useState(
    manufacturerObj ? manufacturerObj?.name : "",
  );
  // State for checking whether the entered manufacturer name is unique
  const [isManufacturerNameUnique, setIsManufacturerNameUnique] =
    useState(true);
  // State for checking whether the uniqueness check for the manufacturer name is in progress
  const [isCheckingManufacturerName, setIsCheckingManufacturerName] =
    useState(false);
  // State for checking whether form submission is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for controlling the visibility of the modal
  const [showModal, setShowModal] = useState(false);

  // Fetching the list of all suppliers when the component is mounted
  useEffect(() => {
    getSupplierSelectList(token, setSupplierList);
  }, []);

  // Validator function to check manufacturer name uniqueness
  const manufacturerNameUniqueValidator = {
    id: "unique",
    text: "Name already taken.",
    validate: () =>
      isCheckingManufacturerName ? true : isManufacturerNameUnique,
  };

  // Async function to validate manufacturer name
  const validateManufacturerName = async (value) => {
    const response = await checkManufacturerName(token, value);
    setIsCheckingManufacturerName(false);
    setIsManufacturerNameUnique(response);
  };

  // Debounced function to validate manufacturer name, prevents multiple
  // requests on each key stroke, waits for the user to stop typing
  const debouncedCheckManufacturerName = useCallback(
    debounce(validateManufacturerName, 500),
    [],
  );

  // Effect hook to validate manufacturer name whenever it changes
  useEffect(() => {
    if (name && name !== manufacturerObj?.name) {
      debouncedCheckManufacturerName(name);
    } else {
      setIsCheckingManufacturerName(false);
    }
  }, [name, debouncedCheckManufacturerName]);

  // Functions to handle modal show and hide
  const handleClose = () => {
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  // Function to reset modal to initial state
  const resetModal = () => {
    if (!manufacturerObj) {
      setRelatedSuppliers([]);
    }
  };

  // Function to handle form submission
  function handleSubmit(values) {
    setIsSubmitting(true);

    // Prepare manufacturer data from form values
    const manufacturerData = {
      name: values.name,
      website: values.websiteUrl,
      suppliers: relatedSuppliers.map((supplier) => supplier.value).join(","),
    };

    // Determine if creating or updating a manufacturer
    const manufacturerPromise = manufacturerObj
      ? updateManufacturer(
          token,
          manufacturerObj.id,
          manufacturerData,
          onSuccessfulSubmit,
        )
      : createManufacturer(token, manufacturerData);

    // Executes function after form is submitted
    manufacturerPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulSubmit(); // Calls the onSuccessfulSubmit function provided as prop
          response.toast(); // Displays a success toast notification
          setIsSubmitting(false);
          handleClose(); // Closes the modal after submitting the form
          if (!manufacturerObj) {
            resetModal(); // Resets the form to initial state
          }
        }, 1000);
      } else {
        showToast(
          // Function for showing error toast notification
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
        setIsSubmitting(false); // Stop showing submission spinner
      }
    });
  }

  return (
    <>
      {/* Button to trigger the modal; displays "Edit Manufacturer" for editing an existing manufacturer,
       "Create Manufacturer" for creating a new one */}
      <Button
        variant={manufacturerObj ? "outline-success" : "success"}
        onClick={handleShow}
      >
        {manufacturerObj ? <EditIcon /> : "Create Manufacturer"}
      </Button>
      {/* Modal for the create/edit form */}
      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          {/* Modal title differentiates between editing and creating */}
          <Modal.Title>
            {manufacturerObj ? "Edit" : "Create"} Manufacturer
          </Modal.Title>
        </Modal.Header>
        {/* Formik component for form handling and validation */}
        <Formik
          /* If editing, the form fields are initially marked as touched to enable validation feedback */
          initialTouched={
            manufacturerObj
              ? {
                  name: true,
                  websiteUrl: true,
                }
              : {}
          }
          /* Initial values are set according to whether we're creating or editing a manufacturer */
          initialValues={{
            name: manufacturerObj ? manufacturerObj?.name : "",
            websiteUrl: manufacturerObj ? manufacturerObj?.website : "",
          }}
          /* Validate the form on mount if we're editing a manufacturer */
          validateOnMount={!!manufacturerObj}
          /* Reinitialize Formik when initialValues change */
          enableReinitialize={true}
          /* The validation schema to be used by Formik, defined by Yup */
          validationSchema={formSchema}
          /* Action to be performed when form is submitted */
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
          }) => {
            return (
              // Form from react-bootstrap, using Formik's onSubmit function
              <Form noValidate onSubmit={handleSubmit}>
                {/* Modal Body starts */}
                <Modal.Body className="d-flex flex-column p-4">
                  {/* Form input group for Manufacturer Name */}
                  <Form.Group
                    controlId="formManufacturerName"
                    className="field-margin"
                  >
                    <Form.Label>Manufacturer Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={values.name}
                      // When the input changes, update the state and start process to validate the uniqueness of the manufacturer name
                      onChange={(event) => {
                        const { value } = event.target;
                        handleChange(event);
                        setIsCheckingManufacturerName(true);
                        setName(value);
                      }}
                      onFocus={() => setFieldTouched("name", true)}
                      onBlur={handleBlur}
                      // Field is marked as invalid if it has a validation error message or if the manufacturer name is not unique
                      isInvalid={
                        (touched.name && !!errors.name) ||
                        !manufacturerNameUniqueValidator.validate()
                      }
                      // Field is marked as valid if touched and no error, and manufacturer name is unique
                      isValid={
                        touched.name &&
                        !errors.name &&
                        manufacturerNameUniqueValidator.validate()
                      }
                    />
                    {/* Validation feedback messages */}
                    {manufacturerNameUniqueValidator.validate() &&
                      !isCheckingManufacturerName && (
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                      )}
                    <Form.Control.Feedback type="invalid">
                      {/* Displays error message if input value doesn't meet validation criteria */}
                      {errors.name}
                      {/* If manufacturer name isn't unique, show error message */}
                      {!manufacturerNameUniqueValidator.validate() &&
                        !isCheckingManufacturerName &&
                        manufacturerNameUniqueValidator.text}
                    </Form.Control.Feedback>

                    {/* Loading message while checking for name uniqueness */}
                    {isCheckingManufacturerName && (
                      <Form.Text className="text-muted">Checking...</Form.Text>
                    )}
                  </Form.Group>

                  {/* Form input group for Website Link */}
                  <Form.Group controlId="formWebsiteUrl" className="mb-4">
                    <Form.Label>Website Link</Form.Label>
                    <Form.Control
                      type="text"
                      name="websiteUrl"
                      value={values.websiteUrl}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("websiteUrl", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.websiteUrl && !!errors.websiteUrl}
                      isValid={touched.websiteUrl && !errors.websiteUrl}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.websiteUrl}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Component to select suppliers */}
                  <DropdownMultiselect
                    optionsList={supplierList}
                    selectedValues={relatedSuppliers}
                    setSelectedValues={setRelatedSuppliers}
                    placeholder="Suppliers"
                  />
                </Modal.Body>

                {/* Modal Footer with the action buttons */}
                <Modal.Footer>
                  {/* If form is submitting, show spinner */}
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
                    // Else, show the Save or Create button, depending on whether we're editing or creating
                    <Button
                      variant="primary"
                      // Disables the button if the form is invalid, or if it's untouched and creating a new manufacturer, or
                      // if the manufacturer name isn't unique or checking name uniqueness
                      disabled={
                        !isValid ||
                        (!manufacturerObj && !dirty) ||
                        !manufacturerNameUniqueValidator.validate() ||
                        isCheckingManufacturerName
                      }
                      onClick={handleSubmit}
                    >
                      {manufacturerObj ? "Save" : "Create"}
                    </Button>
                  )}

                  {/* Close button for the modal */}
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
export default ManufacturerModal;
