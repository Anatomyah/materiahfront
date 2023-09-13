import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { getManufacturerSelectList } from "../../clients/manufacturer_client";
import { isValidURL } from "../../config_and_helpers/helpers";

const AddSupplierModal = () => {
  const { token } = useContext(AppContext);
  const nav = useNavigate();
  const [supplierName, setSupplierName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState();
  const [email, setEmail] = useState();
  const [phonePrefix, setPhonePrefix] = useState();
  const [phoneSuffix, setPhoneSuffix] = useState();
  const [relatedManufacturers, setRelatedManufacturers] = useState();
  const [manufacturerList, setManufacturerList] = useState(null);
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
  }

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Add Product
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
              placeholder="Product Name"
              id="product_name"
              onChange={(e) => setSupplierName(e.target.value)}
              value={supplierName}
            />
            <input
              type="url"
              placeholder="Product Link"
              id="product_link"
              onChange={(e) => setWebsiteUrl(e.target.value)}
              value={websiteUrl}
            />
            {/*<select*/}
            {/*  value={manufacturer}*/}
            {/*  onChange={(e) => setManufacturer(e.target.value)}*/}
            {/*>*/}
            {/*  <option value="" disabled>*/}
            {/*    --Select Manufacturer--*/}
            {/*  </option>*/}
            {/*  {manufacturerList.map((choice, index) => (*/}
            {/*    <option key={index} value={choice.value}>*/}
            {/*      {choice.label}*/}
            {/*    </option>*/}
            {/*  ))}*/}
            {/*</select>*/}
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
            Add Product
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default AddSupplierModal;
