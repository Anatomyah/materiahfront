import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  emailRegex,
  PHONE_PREFIX_CHOICES,
} from "../../config_and_helpers/config";
import { AppContext } from "../../App";
import {
  checkEmailAuthRequired,
  checkPhoneAuthRequired,
  updateUserProfile,
} from "../../clients/user_client";
import * as yup from "yup";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import debounce from "lodash/debounce";
import {
  checkSupplierEmail,
  checkSupplierPhone,
} from "../../clients/supplier_client";
import { showToast } from "../../config_and_helpers/helpers";

// Yup schema for the Supplier Account Formik form
const schema = yup.object().shape({
  firstName: yup
    .string()
    .required("First name is required.")
    .matches(
      /^[a-zA-Z\s]+$/,
      "First name must contain only English letters and spaces.",
    ),
  lastName: yup
    .string()
    .required("Last name is required.")
    .matches(
      /^[a-zA-Z\s]+$/,
      "Last name must contain only English letters and spaces.",
    ),
  contactEmail: yup
    .string()
    .matches(emailRegex, "Enter a valid email")
    .required("Email is required."),
  contactPhonePrefix: yup.string().required("Phone prefix is required."),
  contactPhoneSuffix: yup
    .string()
    .matches(/^[0-9]+$/, "Phone suffix must contain numbers only.")
    .length(7, "Phone suffix must be 7 digits long.")
    .required("Phone suffix is required."),
  supplierEmail: yup
    .string()
    .matches(emailRegex, "Enter a valid email")
    .required("Supplier email is required."),
  supplierPhonePrefix: yup.string().required("Phone prefix is required."),
  supplierPhoneSuffix: yup
    .string()
    .matches(/^[0-9]+$/, "Phone suffix must contain numbers only.")
    .length(7, "Phone suffix must be 7 digits long.")
    .required("Phone suffix is required."),
  supplierWebsite: yup
    .string()
    .url("Invalid URL format.")
    .required("Supplier website is required."),
});

/**
 * `EditSupplierAccountModal` component allows a supplier to edit their personal account details, including contact details and supplier information.
 * This component is a Form placed within a Modal for consumption.
 *
 * @component
 * @example
 *
 * // It is used in the parent component as follows:
 * return (
 *   <EditSupplierAccountModal />
 * );
 *
 * @param {none} None - This component doesn't have any props.
 *
 * @returns {JSX.Element} A React Modal contains a Form for editing user details.
 *
 */
const EditSupplierAccountModal = () => {
  // Importing the token, user details and setUserDetails function from the AppContext
  const { token, userDetails, setUserDetails } = useContext(AppContext);

  // State hook for controlling the visibility of the modal.
  const [showModal, setShowModal] = useState(false);

  // State hook for handling the contact email value.
  const [contactEmail, setContactEmail] = useState("");

  // State hook for handling the supplier email value.
  const [supplierEmail, setSupplierEmail] = useState("");

  // State hook for handling the uniqueness of the contact email. It's initially true.
  const [isContactEmailUnique, setIsContactEmailUnique] = useState(true);

  // State hook indicating whether the contact email is being checked for uniqueness.
  const [isCheckingContactEmail, setIsCheckingContactEmail] = useState(false);

  // State hook for tracking the uniqueness of the supplier email. It's initially true.
  const [isSupplierEmailUnique, setIsSupplierEmailUnique] = useState(true);

  // State hook indicating whether the supplier email is being checked for uniqueness.
  const [isCheckingSupplierEmail, setIsCheckingSupplierEmail] = useState(false);

  // State hook for handling the prefix of supplier phone number.
  const [supplierPhonePrefix, setSupplierPhonePrefix] = useState(
    userDetails ? userDetails.supplier_phone_prefix : "",
  );

  // State hook for handling the suffix of supplier phone number.
  const [supplierPhoneSuffix, setSupplierPhoneSuffix] = useState(
    userDetails ? userDetails.supplier_phone_suffix : "",
  );

  // State hook for determining the uniqueness of the supplier's phone number. It's initially true.
  const [isSupplierPhoneUnique, setIsSupplierPhoneUnique] = useState(true);

  // State hook indicating whether the supplier phone is being checked for uniqueness.
  const [isCheckingSupplierPhone, setIsCheckingSupplierPhone] = useState(false);

  // State hook for handling the prefix of supplier's contact phone number.
  const [supplierContactPhonePrefix, setSupplierContactPhonePrefix] = useState(
    userDetails ? userDetails.phone_prefix : "",
  );

  // State hook for handling the suffix of supplier's contact phone number.
  const [supplierContactPhoneSuffix, setSupplierContactPhoneSuffix] = useState(
    userDetails ? userDetails.phone_suffix : "",
  );

  // State hook for tracking the uniqueness of the supplier's contact phone number. It's initially true.
  const [isSupplierContactPhoneUnique, setIsSupplierContactPhoneUnique] =
    useState(true);

  // State hook indicating whether the supplier contact phone is being checked for uniqueness.
  const [isCheckingSupplierContactPhone, setIsCheckingSupplierContactPhone] =
    useState(false);

  // State hook indicating whether the form is being submitted or not.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Defines validator objects for contact email, supplier contact phone, supplier email,
  // and supplier phone. Each validator consists of an id, a text message,
  // and a validate function which checks if the item is still being checked (returns true)
  // or if the item is unique (returns the calculated uniqueness from state).
  const contactEmailUniqueValidator = {
    id: "unique",
    text: "Email address already taken.",
    validate: () => (isCheckingSupplierEmail ? true : isContactEmailUnique),
  };

  const supplierContactPhoneUniqueValidator = {
    id: "unique",
    text: "Phone number already taken.",
    validate: () =>
      isCheckingSupplierContactPhone ? true : isSupplierContactPhoneUnique,
  };

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

  // Asynchronous functions, which send HTTP requests to check the uniqueness
  // of contact email, supplier contact phone, supplier email, and supplier phone.
  // If the request is successful the response is saved to appropriate state variables
  const validateContactEmail = async (value) => {
    const response = await checkEmailAuthRequired(token, value);
    setIsCheckingContactEmail(false);
    setIsContactEmailUnique(response);
  };

  const validateSupplierContactPhone = async (prefix, suffix) => {
    const response = await checkPhoneAuthRequired(token, prefix, suffix);
    setIsCheckingSupplierContactPhone(false);
    setIsSupplierContactPhoneUnique(response);
  };

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

  // Declares debounced version of validation functions where the invocation of the
  // function will be delayed by 1500ms after each invocation.
  // This is to prevent excessive HTTP requests being sent as the user is typing.
  const debouncedCheckContactEmail = useCallback(
    debounce(validateContactEmail, 1500),
    [],
  );

  const debouncedCheckSupplierContactPhone = useCallback(
    debounce(validateSupplierContactPhone, 1500),
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

  // useEffect hooks which are run whenever the conditions in the dependency arrays are met.
  // In this case, it checks if the value has changed and if the value is different
  // from the value stored in user details.
  // If these conditions are met, it runs the debounced version of validate function.
  // If conditions are not met, it sets the checking status to false
  // and item unique status to true (by default).
  useEffect(() => {
    if (contactEmail && userDetails && contactEmail !== userDetails.email) {
      debouncedCheckContactEmail(contactEmail);
    } else {
      setIsCheckingContactEmail(false);
    }
  }, [contactEmail, debouncedCheckContactEmail]);

  useEffect(() => {
    if (
      supplierEmail &&
      userDetails &&
      supplierEmail !== userDetails.supplier_email
    ) {
      debouncedCheckSupplierEmail(supplierEmail);
    } else {
      setIsCheckingSupplierEmail(false);
    }
  }, [supplierEmail, debouncedCheckSupplierEmail]);

  useEffect(() => {
    if (
      supplierPhonePrefix &&
      supplierPhoneSuffix &&
      supplierPhoneSuffix.length === 7 &&
      userDetails &&
      (supplierPhonePrefix !== userDetails.supplier_phone_prefix ||
        supplierPhoneSuffix !== userDetails.supplier_phone_suffix)
    ) {
      debouncedCheckSupplierPhone(supplierPhonePrefix, supplierPhoneSuffix);
    } else {
      setIsSupplierPhoneUnique(true);
      setIsCheckingSupplierPhone(false);
    }
  }, [supplierPhonePrefix, supplierPhoneSuffix, debouncedCheckSupplierPhone]);

  useEffect(() => {
    if (
      supplierContactPhonePrefix &&
      supplierContactPhoneSuffix &&
      supplierContactPhoneSuffix.length === 7 &&
      userDetails &&
      (supplierContactPhonePrefix !== userDetails.phone_prefix ||
        supplierContactPhoneSuffix !== userDetails.phone_suffix)
    ) {
      debouncedCheckSupplierContactPhone(
        supplierContactPhonePrefix,
        supplierContactPhoneSuffix,
      );
    } else {
      setIsSupplierContactPhoneUnique(true);
      setIsCheckingSupplierContactPhone(false);
    }
  }, [
    supplierContactPhonePrefix,
    supplierContactPhoneSuffix,
    debouncedCheckSupplierContactPhone,
  ]);

  const handleClose = () => {
    setIsSubmitting(false);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  // handleSubmit function: This function is for handling form submission.
  const handleSubmit = (values) => {
    // Using useState, setting 'isSubmitting' to true to denote the form is being submitted
    setIsSubmitting(true);

    // Constructing the data object which will be passed to the updateUserProfile function
    // This object is constructed using the values entered by the user in the form
    const updatedData = {
      email: values.email,
      first_name: values.firstName,
      last_name: values.lastName,
      supplieruserprofile: {
        contact_phone_prefix: values.contactPhonePrefix,
        contact_phone_suffix: values.contactPhoneSuffix,
      },
      supplier_data: {
        supplier_id: userDetails.supplier_id,
        email: values.supplierEmail,
        phone_prefix: values.supplierPhonePrefix,
        phone_suffix: values.supplierPhoneSuffix,
        website: values.supplierWebsite,
      },
    };

    // Making a call to the 'updateUserProfile' function with the required parameters
    updateUserProfile(
      token,
      userDetails.user_id,
      updatedData,
      setUserDetails,
      true,
    ).then((response) => {
      // If response received from the updateUserProfile call is successful
      // The modal is closed using the 'handleClose' function and a toast message is displayed
      if (response && response.success) {
        handleClose();
        response.toast();
      }
      // If response received from the updateUserProfile call is unsuccessful
      // An error toast message is displayed
      else {
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
        );
      }
    });
  };

  return (
    <>
      {/* Button to open the modal for editing supplier details */}
      <Button variant="primary" onClick={handleShow}>
        Edit details
      </Button>

      {/* Modal component for displaying the form. It shows based on the showModal state */}
      <Modal show={showModal} onHide={handleClose}>
        {/* Modal header with a close button */}
        <Modal.Header closeButton>
          <Modal.Title>Edit your personal details</Modal.Title>
        </Modal.Header>

        {/* Formik component to manage the form state, validation, and submission */}
        <Formik
          initialValues={{
            // Initial values are set based on the userDetails context
            contactEmail: userDetails.email,
            firstName: userDetails.first_name,
            lastName: userDetails.last_name,
            contactPhonePrefix: userDetails.phone_prefix,
            contactPhoneSuffix: userDetails.phone_suffix,
            supplierEmail: userDetails.supplier_email,
            supplierPhonePrefix: userDetails.supplier_phone_prefix,
            supplierPhoneSuffix: userDetails.supplier_phone_suffix,
            supplierWebsite: userDetails.supplier_website,
          }}
          initialTouched={{
            // Fields are marked as touched initially
            contactEmail: true,
            firstName: true,
            lastName: true,
            contactPhonePrefix: true,
            contactPhoneSuffix: true,
            supplierEmail: true,
            supplierPhonePrefix: true,
            supplierPhoneSuffix: true,
            supplierWebsite: true,
          }}
          validateOnMount={true}
          enableReinitialize={true}
          validationSchema={schema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {({
            // Destructuring various helpers from Formik's render props
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
                  {/* Form group for contact email with validation and custom feedback */}
                  <Form.Group controlId="contactEmail" className="field-margin">
                    <Form.Label>Contact Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactEmail"
                      // Event handlers for form control interactions
                      value={values.contactEmail}
                      onChange={(event) => {
                        const { value } = event.target;
                        setIsCheckingContactEmail(true);
                        setContactEmail(value);
                        setFieldValue("contactEmail", value);
                      }}
                      onFocus={() => setFieldTouched("contactEmail", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.contactEmail && !!errors.contactEmail) ||
                        !contactEmailUniqueValidator.validate()
                      }
                      isValid={
                        touched.contactEmail &&
                        !errors.contactEmail &&
                        contactEmailUniqueValidator.validate() &&
                        !isCheckingContactEmail
                      }
                    />
                    {contactEmailUniqueValidator.validate() &&
                      !isCheckingContactEmail && (
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                      )}
                    <Form.Control.Feedback type="invalid">
                      {errors.contactEmail}
                      {/* Conditional rendering of feedback messages based on validation state */}
                      {errors.contactEmail &&
                        !contactEmailUniqueValidator.validate() &&
                        !isCheckingContactEmail &&
                        contactEmailUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingContactEmail &&
                      !errors.contactEmail(<Form.Text>Checking...</Form.Text>)}
                  </Form.Group>

                  {/* Similar structure for other form groups like first name, last name, contact phone, supplier email, supplier phone, and supplier website */}
                  {/* Additional form groups for first name, last name, contact phone, supplier email, supplier phone, and supplier website follow a similar pattern */}
                  <Form.Group
                    controlId="contactFirstName"
                    className="field-margin"
                  >
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("firstName", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.firstName && !!errors.firstName}
                      isValid={touched.firstName && !errors.firstName}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="contactLastName"
                    className="field-margin"
                  >
                    <Form.Label>Last name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("lastName", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.lastName && !!errors.lastName}
                      isValid={touched.lastName && !errors.lastName}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Row className="field-margin">
                    <Form.Label>Contact Phone</Form.Label>
                    <Form.Group as={Col} md="3" controlId="contactPhonePrefix">
                      <Form.Select
                        name="contactPhonePrefix"
                        value={values.contactPhonePrefix}
                        onChange={(event) => {
                          const { value } = event.target;
                          setIsCheckingSupplierContactPhone(true);
                          setSupplierContactPhonePrefix(value);
                          setFieldValue("contactPhonePrefix", value);
                        }}
                      >
                        {PHONE_PREFIX_CHOICES.map((choice, index) => (
                          <option key={index} value={choice.value}>
                            {choice.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.contactPhonePrefix}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="9" controlId="contactPhoneSuffix">
                      <Form.Control
                        type="text"
                        name="contactPhoneSuffix"
                        value={values.contactPhoneSuffix}
                        onChange={(event) => {
                          const { value } = event.target;
                          setIsCheckingSupplierContactPhone(true);
                          setSupplierContactPhoneSuffix(value);
                          setFieldValue("contactPhoneSuffix", value);
                        }}
                        onFocus={() =>
                          setFieldTouched("contactPhoneSuffix", true)
                        }
                        onBlur={handleBlur}
                        isInvalid={
                          (touched.contactPhoneSuffix &&
                            !!errors.contactPhoneSuffix) ||
                          !supplierContactPhoneUniqueValidator.validate()
                        }
                        isValid={
                          touched.contactPhoneSuffix &&
                          !errors.contactPhoneSuffix &&
                          supplierContactPhoneUniqueValidator.validate() &&
                          !isCheckingSupplierContactPhone
                        }
                      />
                      <Form.Control.Feedback type="valid">
                        Looks good!
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        {errors.contactPhoneSuffix}
                        {!supplierContactPhoneUniqueValidator.validate() &&
                          !isCheckingSupplierContactPhone &&
                          supplierContactPhoneUniqueValidator.text}
                      </Form.Control.Feedback>
                      {isCheckingSupplierContactPhone && (
                        <Form.Text>Checking...</Form.Text>
                      )}
                    </Form.Group>
                  </Row>
                  <Form.Group
                    controlId="supplierEmail"
                    className="field-margin"
                  >
                    <Form.Label>Supplier Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="supplierEmail"
                      value={values.supplierEmail}
                      onChange={(event) => {
                        const { value } = event.target;
                        setIsCheckingSupplierEmail(true);
                        setSupplierEmail(value);
                        setFieldValue("supplierEmail", value);
                      }}
                      onFocus={() => setFieldTouched("supplierEmail", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.supplierEmail && !!errors.supplierEmail) ||
                        !supplierEmailUniqueValidator.validate()
                      }
                      isValid={
                        touched.supplierEmail &&
                        !errors.supplierEmail &&
                        supplierEmailUniqueValidator.validate() &&
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
                      {errors.supplierEmail}
                      {errors.supplierEmail &&
                        !supplierEmailUniqueValidator.validate() &&
                        !isCheckingSupplierEmail &&
                        supplierEmailUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingSupplierEmail &&
                      !errors.supplierEmail(<Form.Text>Checking...</Form.Text>)}
                  </Form.Group>
                  <Row className="field-margin">
                    <Form.Label>Supplier Phone</Form.Label>
                    <Form.Group as={Col} md="3" controlId="supplierPhonePrefix">
                      <Form.Select
                        name="supplierPhonePrefix"
                        value={values.supplierPhonePrefix}
                        onChange={(event) => {
                          const { value } = event.target;
                          setIsCheckingSupplierPhone(true);
                          setSupplierPhonePrefix(value);
                          setFieldValue("supplierPhonePrefix", value);
                        }}
                      >
                        {PHONE_PREFIX_CHOICES.map((choice, index) => (
                          <option key={index} value={choice.value}>
                            {choice.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.supplierPhonePrefix}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="9" controlId="supplierPhoneSuffix">
                      <Form.Control
                        type="text"
                        name="supplierPhoneSuffix"
                        value={values.supplierPhoneSuffix}
                        onChange={(event) => {
                          const { value } = event.target;
                          setIsCheckingSupplierPhone(true);
                          setSupplierPhoneSuffix(value);
                          setFieldValue("supplierPhoneSuffix", value);
                        }}
                        onFocus={() =>
                          setFieldTouched("supplierPhoneSuffix", true)
                        }
                        onBlur={handleBlur}
                        isInvalid={
                          (touched.supplierPhoneSuffix &&
                            !!errors.supplierPhoneSuffix) ||
                          !supplierPhoneUniqueValidator.validate()
                        }
                        isValid={
                          touched.supplierPhoneSuffix &&
                          !errors.supplierPhoneSuffix &&
                          supplierPhoneUniqueValidator.validate() &&
                          !isCheckingSupplierPhone
                        }
                      />
                      <Form.Control.Feedback type="valid">
                        Looks good!
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        {errors.supplierPhoneSuffix}
                        {!supplierPhoneUniqueValidator.validate() &&
                          !isCheckingSupplierPhone &&
                          supplierPhoneUniqueValidator.text}
                      </Form.Control.Feedback>
                      {isCheckingSupplierPhone && (
                        <Form.Text>Checking...</Form.Text>
                      )}
                    </Form.Group>
                  </Row>
                  <Form.Group
                    controlId="supplierLastName"
                    className="field-margin"
                  >
                    <Form.Label>Supplier Website</Form.Label>
                    <Form.Control
                      type="text"
                      name="supplierWebsite"
                      value={values.supplierWebsite}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("supplierWebsite", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.supplierWebsite && !!errors.supplierWebsite
                      }
                      isValid={
                        touched.supplierWebsite && !errors.supplierWebsite
                      }
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.supplierWebsite}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  {/* Conditional rendering of submit button with a spinner indicating submission state */}
                  {/* The button is disabled based on various conditions like form validity and ongoing validations */}
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
                        !dirty ||
                        !contactEmailUniqueValidator.validate() ||
                        !supplierEmailUniqueValidator.validate() ||
                        isCheckingContactEmail ||
                        isCheckingSupplierEmail ||
                        !supplierPhoneUniqueValidator.validate() ||
                        !supplierContactPhoneUniqueValidator.validate() ||
                        isCheckingSupplierPhone ||
                        isCheckingSupplierContactPhone
                      }
                      onClick={handleSubmit}
                    >
                      Save
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
export default EditSupplierAccountModal;
