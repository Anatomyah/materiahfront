import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import DropdownMultiselect from "../Generic/DropdownMultiselect";
import { isValidURL } from "../../config_and_helpers/helpers";
import { createManufacturer } from "../../clients/manufacturer_client";

const EditOrderModal = ({ onSuccessfulCreate }) => {
  const { token } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  // useEffect(() => {
  //   setIsFilled(name && websiteUrl && relatedSuppliers);
  // }, [name, websiteUrl, relatedSuppliers]);

  // function handleSubmit(e) {
  //   e.preventDefault();
  //   setErrorMessages([]);
  //   const urlValidation = isValidURL(websiteUrl);
  //
  //   if (!urlValidation) {
  //     setIsFilled(false);
  //     setErrorMessages((prevState) => {
  //       const newErrorMessages = [];
  //       return [...prevState, ...newErrorMessages];
  //     });
  //   } else {
  //     const formData = new FormData();
  //     formData.append("name", name);
  //     formData.append("website", websiteUrl);
  //     formData.append(
  //       "suppliers",
  //       relatedSuppliers.map((supplier) => supplier.value).join(","),
  //     );
  //     createManufacturer(token, formData).then((response) => {
  //       if (response && response.success) {
  //         onSuccessfulCreate();
  //         handleClose();
  //       } else {
  //         setErrorMessages((prevState) => [...prevState, response]);
  //       }
  //     });
  //   }
  // }

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  // if (!supplierList) {
  //   return "Loading...";
  // }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Receive Order
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            <legend>Create Product</legend>
            {/*<input*/}
            {/*  type="text"*/}
            {/*  placeholder="Manufacturer Name"*/}
            {/*  id="manufacturer_name"*/}
            {/*  onChange={(e) => setName(e.target.value)}*/}
            {/*  value={name}*/}
            {/*/>*/}
            {/*<DropdownMultiselect*/}
            {/*  optionsList={supplierList}*/}
            {/*  selectedValues={relatedSuppliers}*/}
            {/*  setSelectedValues={setRelatedSuppliers}*/}
            {/*  placeholder="Suppliers"*/}
            {/*/>*/}
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
          {/*<Button*/}
          {/*  variant="primary"*/}
          {/*  disabled={!isFilled}*/}
          {/*  onClick={(e) => {*/}
          {/*    handleSubmit(e);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Create Manufacturer*/}
          {/*</Button>*/}
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default EditOrderModal;
