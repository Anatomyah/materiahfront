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
import EditIcon from "@mui/icons-material/Edit";
import { showToast } from "../../config_and_helpers/helpers";

const formSchema = yup.object().shape({
  name: yup.string().required("Supplier name is required"),
  websiteUrl: yup
    .string()
    .required("Website is required")
    .url("Enter a valid URL"),
  email: yup
    .string()
    .required("Email is required")
    .matches(emailRegex, "Enter a valid email"),
  phonePrefix: yup.string(),
  phoneSuffix: yup
    .string()
    .required("Phone number required")
    .matches(/^\d*$/, "Phone number must be numeric"),
});

const SupplierModal = ({ onSuccessfulSubmit, supplierObj }) => {
  const { token } = useContext(AppContext);
  const [relatedManufacturers, setRelatedManufacturers] = useState(
    supplierObj
      ? supplierObj.manufacturers.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      : [],
  );
  const [manufacturerList, setManufacturerList] = useState([]);
  const [name, setName] = useState(supplierObj ? supplierObj?.name : "");
  const [isSupplierNameUnique, setIsSupplierNameUnique] = useState(true);
  const [isCheckingSupplierName, setIsCheckingSupplierName] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState(
    supplierObj ? supplierObj?.phone_prefix : "050",
  );
  const [phoneSuffix, setPhoneSuffix] = useState(
    supplierObj ? supplierObj?.phone_suffix : "",
  );
  const [isSupplierPhoneUnique, setIsSupplierPhoneUnique] = useState(true);
  const [isCheckingSupplierPhone, setIsCheckingSupplierPhone] = useState(false);
  const [supplierEmail, setSupplierEmail] = useState(
    supplierObj ? supplierObj?.email : "",
  );
  const [isSupplierEmailUnique, setIsSupplierEmailUnique] = useState(false);
  const [isCheckingSupplierEmail, setIsCheckingSupplierEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getManufacturerSelectList(token, setManufacturerList);
  }, []);

  const supplierNameUniqueValidator = {
    id: "unique",
    text: "Name already taken.",
    validate: () => (isCheckingSupplierName ? true : isSupplierNameUnique),
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

  const validateSupplierName = async (value) => {
    const response = await checkSupplierName(token, value);
    setIsCheckingSupplierName(false);
    setIsSupplierNameUnique(response);
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
      debouncedCheckSupplierName(name);
    } else {
      setIsCheckingSupplierName(false);
    }
  }, [name, debouncedCheckSupplierName]);

  useEffect(() => {
    if (supplierEmail && supplierEmail !== supplierObj?.email) {
      debouncedCheckSupplierEmail(supplierEmail);
    } else {
      setIsCheckingSupplierEmail(false);
    }
  }, [supplierEmail, debouncedCheckSupplierEmail]);

  useEffect(() => {
    if (
      phonePrefix &&
      phoneSuffix &&
      phoneSuffix.length === 7 &&
      (phonePrefix !== supplierObj?.phone_prefix ||
        phoneSuffix !== supplierObj?.phone_suffix)
    ) {
      debouncedCheckSupplierPhone(phonePrefix, phoneSuffix);
    } else {
      setIsSupplierPhoneUnique(true);
      setIsCheckingSupplierPhone(false);
    }
  }, [phonePrefix, phoneSuffix, debouncedCheckSupplierPhone]);

  const handleClose = () => {
    setShowModal(false);
  };

  const resetModal = () => {
    setRelatedManufacturers([]);
  };

  const handleShow = () => setShowModal(true);

  function handleSubmit(values) {
    setIsSubmitting(true);

    const supplierData = {
      name: values.name,
      website: values.websiteUrl,
      email: values.email,
      phone_prefix: values.phonePrefix,
      phone_suffix: values.phoneSuffix,
      manufacturers: relatedManufacturers
        .map((manufacturer) => manufacturer.value)
        .join(","),
    };

    const supplierPromise = supplierObj
      ? updateSupplier(token, supplierObj.id, supplierData, onSuccessfulSubmit)
      : createSupplier(token, supplierData);

    supplierPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulSubmit();
          response.toast();
          setIsSubmitting(false);
          handleClose();
          if (!supplierObj) {
            resetModal();
          }
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
  }

  return (
    <>
      <Button
        variant={supplierObj ? "outline-success" : "success"}
        onClick={handleShow}
      >
        {supplierObj ? <EditIcon /> : "Create Supplier"}
      </Button>

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{supplierObj ? "Edit" : "Create"} Supplier</Modal.Title>
        </Modal.Header>
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
                }
              : {}
          }
          initialValues={{
            name: supplierObj ? supplierObj?.name : "",
            websiteUrl: supplierObj ? supplierObj?.website : "",
            email: supplierObj ? supplierObj?.email : "",
            phonePrefix: supplierObj ? supplierObj?.phone_prefix : "050",
            phoneSuffix: supplierObj ? supplierObj?.phone_suffix : "",
          }}
          validateOnMount={!!supplierObj}
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
                    <Form.Label>Office Email</Form.Label>
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
                  <Row className="mb-4">
                    <Form.Label>Supplier Phone</Form.Label>
                    <Form.Group as={Col} md="3" controlId="supplierPhonePrefix">
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
                    <Form.Group as={Col} md="9" controlId="supplierPhoneSuffix">
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
