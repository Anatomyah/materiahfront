import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { isValidURL } from "../../config_and_helpers/helpers";
import DropdownMultiselect from "../Generic/DropdownMultiselect";
import { getSupplierSelectList } from "../../clients/supplier_client";
import { createManufacturer } from "../../clients/manufacturer_client";

const CreateManufacturerModal = ({ onSuccessfulCreate }) => {
  const { token } = useContext(AppContext);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [relatedSuppliers, setRelatedSuppliers] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    getSupplierSelectList(token, setSupplierList).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, []);
  useEffect(() => {
    setIsFilled(name && websiteUrl && relatedSuppliers);
  }, [name, websiteUrl, relatedSuppliers]);

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
  };

  const resetModal = () => {
    setName("");
    setWebsiteUrl("");
    setRelatedSuppliers([]);
    setSupplierList([]);
  };

  const handleShow = () => setShowModal(true);

  function handleSubmit(e) {
    e.preventDefault();
    setErrorMessages([]);
    const urlValidation = isValidURL(websiteUrl);

    if (!urlValidation) {
      setIsFilled(false);
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        return [...prevState, ...newErrorMessages];
      });
    } else {
      const manufacturerData = {
        name: name,
        website: websiteUrl,
        suppliers: relatedSuppliers.map((supplier) => supplier.value).join(","),
      };

      createManufacturer(token, manufacturerData).then((response) => {
        if (response && response.success) {
          setTimeout(() => {
            onSuccessfulCreate();
          }, 1000);
          handleClose();
          resetModal();
        } else {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }

  if (!supplierList) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Add Manufacturer
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Manufacturer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            <input
              type="text"
              placeholder="Manufacturer Name"
              id="manufacturer_name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
            <input
              type="url"
              placeholder="Manufacturer Website"
              id="website"
              onChange={(e) => setWebsiteUrl(e.target.value)}
              value={websiteUrl}
            />
            <DropdownMultiselect
              optionsList={supplierList}
              selectedValues={relatedSuppliers}
              setSelectedValues={setRelatedSuppliers}
              placeholder="Suppliers"
            />
            <button onClick={resetModal}>Reset form</button>
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
            Create Manufacturer
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default CreateManufacturerModal;
