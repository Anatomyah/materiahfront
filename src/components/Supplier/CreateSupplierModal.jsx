import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { getManufacturerSelectList } from "../../clients/manufacturer_client";
import { isValidURL } from "../../config_and_helpers/helpers";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import DropdownMultiselect from "../Generic/DropdownMultiselect";
import { createSupplier } from "../../clients/supplier_client";

const CreateSupplierModal = ({ onSuccessfulCreate }) => {
  const { token } = useContext(AppContext);
  const [supplierName, setSupplierName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("050");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [relatedManufacturers, setRelatedManufacturers] = useState([]);
  const [manufacturerList, setManufacturerList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    getManufacturerSelectList(token, setManufacturerList).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, []);

  useEffect(() => {
    setIsFilled(
      supplierName &&
        websiteUrl &&
        email &&
        phonePrefix &&
        phoneSuffix &&
        relatedManufacturers,
    );
  }, [
    supplierName,
    websiteUrl,
    email,
    phonePrefix,
    phoneSuffix,
    relatedManufacturers,
  ]);

  function handleSubmit(e) {
    e.preventDefault();
    setErrorMessages([]);
    const urlValidation = isValidURL(websiteUrl);
    const emailValidation = document
      .getElementById("supplier_email")
      .checkValidity();

    if (!urlValidation || !emailValidation) {
      setIsFilled(false);
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        if (!urlValidation) {
          newErrorMessages.push("Invalid website link");
        }
        if (!emailValidation) {
          newErrorMessages.push("Invalid email address");
        }
        return [...prevState, ...newErrorMessages];
      });
    } else {
      const formData = new FormData();
      formData.append("name", supplierName);
      formData.append("website", websiteUrl);
      formData.append("email", email);
      formData.append("phone_prefix", phonePrefix);
      formData.append("phone_suffix", phoneSuffix);
      formData.append(
        "manufacturers",
        relatedManufacturers
          .map((manufacturer) => manufacturer.value)
          .join(","),
      );
      createSupplier(token, formData).then((response) => {
        if (response && response.success) {
          onSuccessfulCreate();
          handleClose();
        } else {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  if (!manufacturerList) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Add Supplier
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            <legend>Create Product</legend>
            <input
              type="text"
              placeholder="Supplier Name"
              id="supplier_name"
              onChange={(e) => setSupplierName(e.target.value)}
              value={supplierName}
            />
            <input
              type="url"
              placeholder="Supplier Website"
              id="supplier_website"
              onChange={(e) => setWebsiteUrl(e.target.value)}
              value={websiteUrl}
            />
            <input
              type="email"
              placeholder="Customer service Email"
              id="supplier_email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <select
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
            >
              {PHONE_PREFIX_CHOICES.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <input
              id="phone"
              onChange={(e) => setPhoneSuffix(e.target.value)}
              type="text"
              placeholder="Office Phone"
              value={phoneSuffix}
            />
            <DropdownMultiselect
              optionsList={manufacturerList}
              selectedValues={relatedManufacturers}
              setSelectedValues={setRelatedManufacturers}
              placeholder="Manufacturers"
            />
          </form>
          {errorMessages.length > 0 && (
            <ul>
              {errorMessages.map((error, id) => (
                <li key={id} className="text-danger fw-bold">
                  {error}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            disabled={!isFilled}
            onClick={(e) => {
              handleSubmit(e);
            }}
          >
            Create Supplier
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default CreateSupplierModal;