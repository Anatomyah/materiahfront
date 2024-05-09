import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { getManufacturerSelectList } from "../../clients/manufacturer_client";
import DropdownMultiselect from "../Generic/DropdownMultiselect";
import {
  checkSupplierEmail,
  checkSupplierName,
  checkSupplierPhone,
  createSupplier,
  updateSupplier,
} from "../../clients/supplier_client";
import { Formik } from "formik";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import * as yup from "yup";
import {
  emailRegex,
  PHONE_PREFIX_CHOICES,
} from "../../config_and_helpers/config";
import debounce from "lodash/debounce";
import "./SupplierComponentStyle.css";
import { PencilFill } from "react-bootstrap-icons";
import { showToast } from "../../config_and_helpers/helpers";
import SecondaryEmailComponent from "./SecondaryEmailComponent";

// Yup schema for the supplier Formik form
const formSchema = yup.object().shape({
  name: yup.string().required("Supplier name is required"),
  websiteUrl: yup.string().url("Enter a valid URL"),
  email: yup.string().matches(emailRegex, "Enter a valid email"),
  phonePrefix: yup.string(),
  phoneSuffix: yup.string().matches(/^\d*$/, "Phone number must be numeric"),
  secondaryEmails: yup.array().of(yup.string().email("Enter a valid email")),
});

/**
 * `SupplierModal` is a reactive Bootstrap Modal component used for creating and editing suppliers in the system.
 *
 * It provides an interactive form with live validation, accepting input for the supplier's:
 * - Name
 * - Website Link
 * - Main Email
 * - Phone
 *
 * It also links the supplier to one or more manufacturers via a multi-select dropdown.
 *
 * `SupplierModal` fetches the available list of manufacturers on mount.
 * This list is used for both displaying the current associations of an existing supplier, and selecting associations for a new supplier.
 *
 * In the case of editing an existing supplier, it accepts a `supplierObj` prop that contains the supplier's existing details.
 * Calling the submitted form's `onSubmit` method creates or updates the supplier as intended.
 *
 * A spinner is shown during the API calls for creation/update.
 *
 * @component
 * @param {Object} props The props.
 * @param {Function} props.onSuccessfulSubmit The function to run after successfully submitting the form.
 * @param {(Object|null)} [props.supplierObj=null] The supplier object being edited, or null for creating a supplier.
 *
 * @example
 *
 * // An existing supplier object
 * const supplier = { id: '1', name: 'Supplier1', email: 'test@example.com', website: 'www.example.com' };
 *
 * // Refetch function
 * const refetchSuppliers = () => // Execute fetch to update suppliers data
 *
 * // To create a new supplier
 * <SupplierModal onSuccessfulSubmit={refetchSuppliers} />
 *
 * // To edit an existing supplier
 * <SupplierModal onSuccessfulSubmit={refetchSuppliers} supplierObj={supplier} />
 */
const SupplierModal = ({ onSuccessfulSubmit, supplierObj }) => {
  const { token } = useContext(AppContext); // Fetching the token from the AppContext
  const [relatedManufacturers, setRelatedManufacturers] = useState(
    supplierObj
      ? supplierObj.manufacturers.map((item) => ({
          // Map manufacturers to id/label pairs
          value: item.id,
          label: item.name,
        }))
      : [], // Initialize with empty array if supplierObj is not provided
  );
  const [manufacturerList, setManufacturerList] = useState([]); // State to hold list of manufacturers
  const [name, setName] = useState(supplierObj?.name || ""); // State to hold name, default to provided supplier's name
  // State to hold the boolean whether supplier name is unique or not. Initialized as true
  const [isSupplierNameUnique, setIsSupplierNameUnique] = useState(true);
  // State to indicate whether the system is still checking for unique supplier name. Initialized as false
  const [isCheckingSupplierName, setIsCheckingSupplierName] = useState(false);
  // More state variables for phone prefix, suffix, supplier's unique phone
  // The rest is the same pattern as name
  // State variables for email and submitting status
  const [phonePrefix, setPhonePrefix] = useState(
    supplierObj?.phone_prefix || "",
  );
  const [phoneSuffix, setPhoneSuffix] = useState(
    supplierObj?.phone_suffix || "",
  );
  const [isSupplierPhoneUnique, setIsSupplierPhoneUnique] = useState(true);
  const [isCheckingSupplierPhone, setIsCheckingSupplierPhone] = useState(false);
  const [supplierEmail, setSupplierEmail] = useState(supplierObj?.email || "");
  const [secondaryEmails, setSecondaryEmails] = useState(
    supplierObj?.secondary_emails.map(
      (secondaryEmail) => secondaryEmail.email,
    ) || [],
  );
  const [isSupplierEmailUnique, setIsSupplierEmailUnique] = useState(true);
  const [isCheckingSupplierEmail, setIsCheckingSupplierEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for controlling the modal visibility

  useEffect(() => {
    // UseEffect to fetch the manufacturer list when the component mounts
    getManufacturerSelectList(token, setManufacturerList);
  }, []);

  // Validators to check uniqueness of name, email and phone number
  const supplierNameUniqueValidator = {
    id: "unique",
    text: "Name already taken.",
    validate: () => (isCheckingSupplierName ? true : isSupplierNameUnique),
  };

  // More validators for email and phone number. Same pattern as name

  const supplierEmailUniqueValidator = {
    id: "unique",
    text: "Email address already taken.",
    validate: () => (isCheckingSupplierEmail ? true : isSupplierEmailUnique),
  };

  const supplierPhoneUniqueValidator = {
    id: "unique",
    text: "Phone number already taken.",
    validate: () => (isCheckingSupplierPhone ? true : isSupplierPhoneUnique),
  };

  // Asynchronous function to validate supplier name
  const validateSupplierName = async (value) => {
    const response = await checkSupplierName(token, value); // Call the API
    setIsCheckingSupplierName(false); // Turn off the checking status after checking
    setIsSupplierNameUnique(response); // Set the uniqueness of supplier name to the response of API
  };

  // More validators for email and phone number. Same pattern as name
  const validateSupplierEmail = async (value) => {
    const response = await checkSupplierEmail(token, value);
    setIsCheckingSupplierEmail(false);
    setIsSupplierEmailUnique(response);
  };

  const validateSupplierPhone = async (prefix, suffix) => {
    const response = await checkSupplierPhone(token, prefix, suffix);
    setIsCheckingSupplierPhone(false);
    setIsSupplierPhoneUnique(response);
  };

  // Debounced version of validator function to prevent excessive API calls when fast typing
  // Using debounce from lodash for checking Supplier name, email and phone
  // 1500 milliseconds set as the wait time. Adjust according to your needs
  const debouncedCheckSupplierName = useCallback(
    debounce(validateSupplierName, 1500),
    [],
  );

  const debouncedCheckSupplierEmail = useCallback(
    debounce(validateSupplierEmail, 1500),
    [],
  );

  const debouncedCheckSupplierPhone = useCallback(
    debounce(validateSupplierPhone, 1500),
    [],
  );

  useEffect(() => {
    if (name && name !== supplierObj?.name) {
      // If name exists and it's different from the existing supplier name
      debouncedCheckSupplierName(name); // Check if it's unique
    } else {
      setIsCheckingSupplierName(false); // If the name is the same, stop checking
    }
  }, [name, debouncedCheckSupplierName]); // Effect dependent on name & debouncedCheckSupplierName

  // Similar useEffect hooks for supplier email and phone
  useEffect(() => {
    if (supplierEmail && supplierEmail !== supplierObj?.email) {
      debouncedCheckSupplierEmail(supplierEmail);
    } else {
      setIsCheckingSupplierEmail(false);
    }
  }, [supplierEmail, debouncedCheckSupplierEmail]);

  useEffect(() => {
    // If phonePrefix exists, and phoneSuffix is 7 characters long, and either prefix or suffix is different from existing one
    if (
      phonePrefix &&
      phoneSuffix &&
      phoneSuffix.length === 7 &&
      (phonePrefix !== supplierObj?.phone_prefix ||
        phoneSuffix !== supplierObj?.phone_suffix)
    ) {
      debouncedCheckSupplierPhone(phonePrefix, phoneSuffix);
    } else {
      setIsSupplierPhoneUnique(true); // If they're the same, it's considered unique
      setIsCheckingSupplierPhone(false); // If they're the same, stop checking
    }
  }, [phonePrefix, phoneSuffix, debouncedCheckSupplierPhone]);

  const handleClose = () => {
    setShowModal(false); // Function to close the modal
  };

  const resetModal = () => {
    setRelatedManufacturers([]); // Function to reset the modal state
  };

  const handleShow = () => setShowModal(true); // Function to open the modal

  // Function to handle the addition of a new item into the secondaryEmails Array
  const addSecondaryEmail = (e) => {
    e.preventDefault();
    setSecondaryEmails([...secondaryEmails, ""]);
  };

  // Function to handle the change of a given secondary email value
  const updateSecondaryEmail = (e, index, value) => {
    e.preventDefault();
    const newSecondaryEmails = [...secondaryEmails];
    newSecondaryEmails[index] = value;
    setSecondaryEmails(newSecondaryEmails);
  };

  // Function to handle the deletion of a secondary email
  const removeSecondaryEmail = (e, index) => {
    e.preventDefault();
    const newSecondaryEmails = [...secondaryEmails];
    newSecondaryEmails.splice(index, 1);
    setSecondaryEmails(newSecondaryEmails);
  };

  // Function to handle submitting the supplier form
  function handleSubmit(values) {
    setIsSubmitting(true); // Set the submitting status to true

    // Assemble the supplier data from the form values and state
    const supplierData = {
      name: values.name,
      website: values.websiteUrl,
      email: values.email,
      phone_prefix: values.phonePrefix,
      phone_suffix: values.phoneSuffix,
      manufacturers: relatedManufacturers // Convert array of selected manufacturers to comma separated string
        .map((manufacturer) => manufacturer.value)
        .join(","),
    };

    // check if the 'supplierObj' not exist
    if (!supplierObj) {
      // check if there are secondary email addresses
      if (secondaryEmails.length > 0) {
        // assign the secondary email addresses to the 'supplierData'
        supplierData.secondary_emails = secondaryEmails;
      }
    } else {
      // 'supplierObj' does exist
      // check if the 'supplierObj' has no secondary email addresses and there's ones provided
      if (
        supplierObj.secondary_emails.length === 0 &&
        secondaryEmails.length > 0
      ) {
        // assign the new secondary emails to the 'supplierData'
        supplierData.secondary_emails = secondaryEmails;
      }
      // check if the 'supplierObj' has secondary email addresses
      if (supplierObj.secondary_emails.length > 0) {
        // filter out the email objects that are not included in the provided secondary emails and get their IDs
        const idsOfEmailsNotIncluded = supplierObj.secondary_emails
          .filter((emailObj) => !secondaryEmails.includes(emailObj.email))
          .map((emailObj) => emailObj.id);
        // filter out the secondary emails that are not already in the 'supplierObj'
        const secondaryEmailsToAdd = secondaryEmails.filter(
          (email) =>
            !supplierObj.secondary_emails.some(
              (emailObj) => emailObj.email === email,
            ),
        );

        // check if there are any email ids that were not included
        if (idsOfEmailsNotIncluded.length > 0) {
          // add these ids to a new array in the 'supplierData' to mark them for deletion
          supplierData.secondary_emails_to_delete = idsOfEmailsNotIncluded;
        }
        // check if there are new secondary emails to be added
        if (secondaryEmailsToAdd.length > 0) {
          // add these new emails to the 'supplierData'
          supplierData.secondary_emails = secondaryEmailsToAdd;
        }
      }
    }

    // Depending on whether a supplierObj was passed in (indicating an edit), either call updateSupplier or createSupplier
    const supplierPromise = supplierObj
      ? updateSupplier(token, supplierObj.id, supplierData, onSuccessfulSubmit)
      : createSupplier(token, supplierData);

    supplierPromise.then((response) => {
      if (response && response.success) {
        // If the API call was successful
        setTimeout(() => {
          // Timeout for UX purposes
          onSuccessfulSubmit(); // Call the success handler
          response.toast(); // Show a success toast
          setIsSubmitting(false); // Set submitting status to false
          handleClose(); // Close the modal
          if (!supplierObj) {
            // If a new supplier was being created
            resetModal(); // Reset the modal state
          }
        }, 1000);
      } else {
        // If the API call was not successful
        showToast(
          // Show an error toast
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
        setIsSubmitting(false); // Set submitting status to false
      }
    });
  }

  return (
    <>
      {/* Button for opening the modal */}
      <Button
        variant={supplierObj ? "outline-success" : "success"}
        onClick={handleShow}
      >
        {/* Change button content depending on whether it's in edit mode or create mode */}
        {supplierObj ? <PencilFill /> : "Create Supplier"}
      </Button>

      {/* Modal component */}
      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          {/* Change modal title depending on whether it's in edit mode or create mode */}
          <Modal.Title>{supplierObj ? "Edit" : "Create"} Supplier</Modal.Title>
        </Modal.Header>

        {/* Formik component for handling form */}
        <Formik
          initialTouched={
            supplierObj
              ? {
                  name: true,
                  websiteUrl: true,
                  email: true,
                  phonePrefix: true,
                  phoneSuffix: true,
                  relatedManufacturers: true,
                  secondaryEmails: secondaryEmails.map(() => true),
                }
              : {
                  secondaryEmails: secondaryEmails.map(() => false),
                }
          }
          initialValues={{
            name: supplierObj ? supplierObj?.name : name,
            websiteUrl: supplierObj?.website || "",
            email: supplierObj?.email || "",
            phonePrefix: supplierObj?.phone_prefix || "",
            phoneSuffix: supplierObj?.phone_suffix || "",
            secondaryEmails: secondaryEmails,
          }}
          validateOnMount={true}
          // enableReinitialize={true}
          validationSchema={formSchema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {/* Form fields and submit buttons are here */}
          {({
            handleChange,
            handleSubmit,
            values,
            handleBlur,
            touched,
            errors,
            isValid,
            setFieldTouched,
            setFieldValue,
            dirty,
          }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body className="d-flex flex-column p-4">
                  <Form.Group
                    controlId="formSupplierName"
                    className="field-margin"
                  >
                    <Form.Label>Supplier Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={(event) => {
                        const { value } = event.target;
                        handleChange(event);
                        setIsCheckingSupplierName(true);
                        setName(value);
                      }}
                      onFocus={() => setFieldTouched("name", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.name && !!errors.name) ||
                        !supplierNameUniqueValidator.validate()
                      }
                      isValid={
                        touched.name &&
                        !errors.name &&
                        supplierNameUniqueValidator.validate()
                      }
                    />
                    {supplierNameUniqueValidator.validate() &&
                      !isCheckingSupplierName && (
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                      )}
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                      {!supplierNameUniqueValidator.validate() &&
                        !isCheckingSupplierName &&
                        supplierNameUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingSupplierName && (
                      <Form.Text className="text-muted">Checking...</Form.Text>
                    )}
                  </Form.Group>
                  <Form.Group
                    controlId="formWebsiteUrl"
                    className="field-margin"
                  >
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
                  <Form.Group
                    controlId="supplierEmail"
                    className="field-margin"
                  >
                    <Form.Label>Main Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="email"
                      value={values.email}
                      onChange={(event) => {
                        const { value } = event.target;
                        handleChange(event);
                        setIsCheckingSupplierEmail(true);
                        setSupplierEmail(value);
                      }}
                      onFocus={() => setFieldTouched("email", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.email && !!errors.email) ||
                        (!supplierEmailUniqueValidator.validate() &&
                          values.email !== supplierEmail)
                      }
                      isValid={
                        touched.email &&
                        !errors.email &&
                        supplierEmailUniqueValidator.validate() &&
                        values.email !== supplierObj?.email &&
                        !isCheckingSupplierEmail
                      }
                    />
                    {supplierEmailUniqueValidator.validate() &&
                      !isCheckingSupplierEmail && (
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                      )}
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                      {!errors.email &&
                        supplierEmailUniqueValidator.validate() &&
                        !isCheckingSupplierEmail &&
                        supplierEmailUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingSupplierEmail && !errors.email && (
                      <Form.Text>Checking...</Form.Text>
                    )}
                  </Form.Group>
                  {/* If there are any secondary emails, render them via the SecondaryEmailComponent */}
                  {secondaryEmails.length > 0
                    ? secondaryEmails.map((email, index) => (
                        <SecondaryEmailComponent
                          key={index}
                          index={index}
                          secondaryEmail={email}
                          handleDeleteEmail={removeSecondaryEmail}
                          onEmailChange={updateSecondaryEmail}
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
                      ))
                    : null}
                  <Button
                    className="mb-2"
                    variant={"success"}
                    onClick={(e) => addSecondaryEmail(e)}
                  >
                    Add Email
                  </Button>
                  <Row className="mb-4">
                    <Form.Label>Supplier Phone</Form.Label>
                    <Form.Group as={Col} md="5" controlId="supplierPhonePrefix">
                      <Form.Select
                        name="phonePrefix"
                        value={values.phonePrefix}
                        onChange={(event) => {
                          const { value } = event.target;
                          handleChange(event);
                          setIsCheckingSupplierPhone(true);
                          setPhonePrefix(value);
                        }}
                      >
                        <option value="" disabled>
                          - Select Prefix -
                        </option>
                        {PHONE_PREFIX_CHOICES.map((choice, index) => (
                          <option key={index} value={choice.value}>
                            {choice.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.phonePrefix}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="7" controlId="supplierPhoneSuffix">
                      <Form.Control
                        type="text"
                        name="phoneSuffix"
                        value={values.phoneSuffix}
                        onChange={(event) => {
                          const { value } = event.target;
                          handleChange(event);
                          setIsCheckingSupplierPhone(true);
                          setPhoneSuffix(value);
                        }}
                        onFocus={() => setFieldTouched("phoneSuffix", true)}
                        onBlur={handleBlur}
                        isInvalid={
                          (touched.phoneSuffix && !!errors.phoneSuffix) ||
                          !supplierPhoneUniqueValidator.validate()
                        }
                        isValid={
                          touched.phoneSuffix &&
                          !errors.phoneSuffix &&
                          supplierPhoneUniqueValidator.validate() &&
                          !isCheckingSupplierPhone
                        }
                      />
                      <Form.Control.Feedback type="valid">
                        Looks good!
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        {errors.phoneSuffix}
                        {!supplierPhoneUniqueValidator.validate() &&
                          !isCheckingSupplierPhone &&
                          supplierPhoneUniqueValidator.text}
                      </Form.Control.Feedback>
                      {isCheckingSupplierPhone && (
                        <Form.Text>Checking...</Form.Text>
                      )}
                    </Form.Group>
                  </Row>
                  <DropdownMultiselect
                    optionsList={manufacturerList}
                    selectedValues={relatedManufacturers}
                    setSelectedValues={setRelatedManufacturers}
                    placeholder="Manufacturers"
                  />
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
                        (!supplierObj && !dirty) ||
                        !supplierNameUniqueValidator.validate() ||
                        !supplierEmailUniqueValidator.validate() ||
                        !supplierPhoneUniqueValidator.validate() ||
                        isCheckingSupplierName ||
                        isCheckingSupplierEmail ||
                        isCheckingSupplierPhone
                      }
                      onClick={handleSubmit}
                    >
                      {supplierObj ? "Save" : "Create"}
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
export default SupplierModal;
