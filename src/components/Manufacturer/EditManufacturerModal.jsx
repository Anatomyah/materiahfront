import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { isValidURL } from "../../config_and_helpers/helpers";
import DropdownMultiselect from "../Generic/DropdownMultiselect";
import { getSupplierSelectList } from "../../clients/supplier_client";
import { updateManufacturer } from "../../clients/manufacturer_client";

const EditManufacturerModal = ({ manufacturerObj, onSuccessfulUpdate }) => {
  const { token } = useContext(AppContext);
  const [name, setName] = useState(manufacturerObj.name);
  const [websiteUrl, setWebsiteUrl] = useState(manufacturerObj.website);
  const [relatedSuppliers, setRelatedSuppliers] = useState(
    manufacturerObj.suppliers.map((item) => ({
      value: item.id,
      label: item.name,
    })),
  );
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
      const updatedData = {
        name: name,
        website: websiteUrl,
        suppliers: relatedSuppliers.map((supplier) => supplier.value).join(","),
      };
      updateManufacturer(
        token,
        manufacturerObj.id,
        updatedData,
        onSuccessfulUpdate,
      ).then((response) => {
        if (response && response.success) {
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
    resetModal();
  };

  const resetModal = () => {
    setName(manufacturerObj.name);
    setWebsiteUrl(manufacturerObj.website);
    setRelatedSuppliers(
      manufacturerObj.suppliers.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    );
  };

  const handleShow = () => setShowModal(true);

  if (!supplierList) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Edit Manufacturer
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Manufacturer</Modal.Title>
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
            Update Manufacturer
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default EditManufacturerModal;
