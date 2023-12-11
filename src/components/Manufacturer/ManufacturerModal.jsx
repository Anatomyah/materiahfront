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

const formSchema = yup.object().shape({
  name: yup.string().required("Supplier name is required"),
  websiteUrl: yup
    .string()
    .required("Website is required")
    .url("Enter a valid URL"),
});

const ManufacturerModal = ({ onSuccessfulSubmit, manufacturerObj }) => {
  const { token } = useContext(AppContext);
  const [relatedSuppliers, setRelatedSuppliers] = useState(
    manufacturerObj
      ? manufacturerObj.suppliers.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      : [],
  );
  const [supplierList, setSupplierList] = useState([]);
  const [name, setName] = useState(
    manufacturerObj ? manufacturerObj?.name : "",
  );
  const [isManufacturerNameUnique, setIsManufacturerNameUnique] =
    useState(true);
  const [isCheckingManufacturerName, setIsCheckingManufacturerName] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getSupplierSelectList(token, setSupplierList);
  }, []);

  const manufacturerNameUniqueValidator = {
    id: "unique",
    text: "Name already taken.",
    validate: () =>
      isCheckingManufacturerName ? true : isManufacturerNameUnique,
  };

  const validateManufacturerName = async (value) => {
    const response = await checkManufacturerName(token, value);
    setIsCheckingManufacturerName(false);
    setIsManufacturerNameUnique(response);
  };

  const debouncedCheckManufacturerName = useCallback(
    debounce(validateManufacturerName, 500),
    [],
  );

  useEffect(() => {
    if (name && name !== manufacturerObj?.name) {
      debouncedCheckManufacturerName(name);
    } else {
      setIsCheckingManufacturerName(false);
    }
  }, [name, debouncedCheckManufacturerName]);

  const handleClose = () => {
    setShowModal(false);
  };

  const resetModal = () => {
    if (!manufacturerObj) {
      setRelatedSuppliers([]);
    }
  };

  const handleShow = () => setShowModal(true);

  function handleSubmit(values) {
    setIsSubmitting(true);

    const manufacturerData = {
      name: values.name,
      website: values.websiteUrl,
      suppliers: relatedSuppliers.map((supplier) => supplier.value).join(","),
    };

    const manufacturerPromise = manufacturerObj
      ? updateManufacturer(
          token,
          manufacturerObj.id,
          manufacturerData,
          onSuccessfulSubmit,
        )
      : createManufacturer(token, manufacturerData);

    manufacturerPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulSubmit();
          response.toast();
          setIsSubmitting(false);
          handleClose();
          if (!manufacturerObj) {
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
        variant={manufacturerObj ? "outline-success" : "success"}
        onClick={handleShow}
      >
        {manufacturerObj ? <EditIcon /> : "Create Manufacturer"}
      </Button>

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {manufacturerObj ? "Edit" : "Create"} Manufacturer
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialTouched={
            manufacturerObj
              ? {
                  name: true,
                  websiteUrl: true,
                }
              : {}
          }
          initialValues={{
            name: manufacturerObj ? manufacturerObj?.name : "",
            websiteUrl: manufacturerObj ? manufacturerObj?.website : "",
          }}
          validateOnMount={!!manufacturerObj}
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
                    controlId="formManufacturerName"
                    className="field-margin"
                  >
                    <Form.Label>Manufacturer Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={(event) => {
                        const { value } = event.target;
                        handleChange(event);
                        setIsCheckingManufacturerName(true);
                        setName(value);
                      }}
                      onFocus={() => setFieldTouched("name", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.name && !!errors.name) ||
                        !manufacturerNameUniqueValidator.validate()
                      }
                      isValid={
                        touched.name &&
                        !errors.name &&
                        manufacturerNameUniqueValidator.validate()
                      }
                    />
                    {manufacturerNameUniqueValidator.validate() &&
                      !isCheckingManufacturerName && (
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                      )}
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                      {!manufacturerNameUniqueValidator.validate() &&
                        !isCheckingManufacturerName &&
                        manufacturerNameUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingManufacturerName && (
                      <Form.Text className="text-muted">Checking...</Form.Text>
                    )}
                  </Form.Group>
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
                  <DropdownMultiselect
                    optionsList={supplierList}
                    selectedValues={relatedSuppliers}
                    setSelectedValues={setRelatedSuppliers}
                    placeholder="Suppliers"
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
                        (!manufacturerObj && !dirty) ||
                        !manufacturerNameUniqueValidator.validate() ||
                        isCheckingManufacturerName
                      }
                      onClick={handleSubmit}
                    >
                      {manufacturerObj ? "Save" : "Create"}
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
export default ManufacturerModal;
