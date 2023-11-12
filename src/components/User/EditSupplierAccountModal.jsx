import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import { AppContext } from "../../App";
import {
  checkEmailAuthRequired,
  checkPhoneAuthRequired,
  updateUserProfile,
} from "../../clients/user_client";
import * as yup from "yup";
import { Col, Form, Row } from "react-bootstrap";
import { Formik } from "formik";
import debounce from "lodash/debounce";
import {
  checkSupplierEmail,
  checkSupplierPhone,
} from "../../clients/supplier_client";

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
    .email("Invalid email format.")
    .required("Email is required."),
  contactPhonePrefix: yup.string().required("Phone prefix is required."),
  contactPhoneSuffix: yup
    .string()
    .matches(/^[0-9]+$/, "Phone suffix must contain numbers only.")
    .length(7, "Phone suffix must be 7 digits long.")
    .required("Phone suffix is required."),
  supplierEmail: yup
    .string()
    .email("Invalid email format.")
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

const EditSupplierAccountModal = () => {
  const { token, userDetails, setUserDetails } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [isContactEmailUnique, setIsContactEmailUnique] = useState(true);
  const [isCheckingContactEmail, setIsCheckingContactEmail] = useState(false);
  const [isSupplierEmailUnique, setIsSupplierEmailUnique] = useState(true);
  const [isCheckingSupplierEmail, setIsCheckingSupplierEmail] = useState(false);
  const [supplierPhonePrefix, setSupplierPhonePrefix] = useState(
    userDetails ? userDetails.supplier_phone_prefix : "",
  );
  const [supplierPhoneSuffix, setSupplierPhoneSuffix] = useState(
    userDetails ? userDetails.supplier_phone_suffix : "",
  );
  const [isSupplierPhoneUnique, setIsSupplierPhoneUnique] = useState(true);
  const [isCheckingSupplierPhone, setIsCheckingSupplierPhone] = useState(false);
  const [supplierContactPhonePrefix, setSupplierContactPhonePrefix] = useState(
    userDetails ? userDetails.phone_prefix : "",
  );
  const [supplierContactPhoneSuffix, setSupplierContactPhoneSuffix] = useState(
    userDetails ? userDetails.phone_suffix : "",
  );
  const [isSupplierContactPhoneUnique, setIsSupplierContactPhoneUnique] =
    useState(true);
  const [isCheckingSupplierContactPhone, setIsCheckingSupplierContactPhone] =
    useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const contactEmailUniqueValidator = {
    id: "unique",
    text: "Email address already taken.",
    validate: () => (isCheckingSupplierEmail ? true : isContactEmailUnique),
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

  const supplierContactPhoneUniqueValidator = {
    id: "unique",
    text: "Phone number already taken.",
    validate: () =>
      isCheckingSupplierContactPhone ? true : isSupplierContactPhoneUnique,
  };

  const validateContactEmail = async (value) => {
    const response = await checkEmailAuthRequired(token, value);
    setIsCheckingContactEmail(false);
    setIsContactEmailUnique(response);
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

  const validateSupplierContactPhone = async (prefix, suffix) => {
    const response = await checkPhoneAuthRequired(token, prefix, suffix);
    setIsCheckingSupplierContactPhone(false);
    setIsSupplierContactPhoneUnique(response);
  };

  const debouncedCheckContactEmail = useCallback(
    debounce(validateContactEmail, 1500),
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

  const debouncedCheckSupplierContactPhone = useCallback(
    debounce(validateSupplierContactPhone, 1500),
    [],
  );

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
    setErrorMessages([]);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  const handleSubmit = (values) => {
    setErrorMessages([]);

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
    updateUserProfile(
      token,
      userDetails.user_id,
      updatedData,
      setUserDetails,
      true,
    ).then((response) => {
      if (response && response.success) {
        handleClose();
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Edit details
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit your personal details</Modal.Title>
        </Modal.Header>

        <Formik
          initialValues={{
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
                  <Form.Group controlId="contactEmail" className="field-margin">
                    <Form.Label>Contact Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactEmail"
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
                      {!contactEmailUniqueValidator.validate() &&
                        !isCheckingContactEmail &&
                        contactEmailUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingContactEmail && (
                      <Form.Text>Checking...</Form.Text>
                    )}
                  </Form.Group>
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
                      {!supplierEmailUniqueValidator.validate() &&
                        !isCheckingSupplierEmail &&
                        supplierEmailUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingSupplierEmail && (
                      <Form.Text>Checking...</Form.Text>
                    )}
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
