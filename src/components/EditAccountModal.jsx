import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { validateId, validatePhoneSuffix } from "../helpers";
import { PHONE_PREFIX_CHOICES } from "../config";

const EditAccountModal = ({ details }) => {
  const [showModal, setShowModal] = useState(false);
  const [idNumber, setIdNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [isFilled, setIsFilled] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    setFirstName(details.first_name);
    setLastName(details.last_name);
    setPhonePrefix(details.phone_prefix);
    setPhoneSuffix(details.phone_suffix);
    setIdNumber(details.id_number);
  }, [showModal]);

  useEffect(() => {
    setIsFilled(firstName && lastName && idNumber && phoneSuffix);
  }, [firstName, lastName, idNumber, phoneSuffix]);
  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(true);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const idValidation = validateId(idNumber);
    const phoneValidation = validatePhoneSuffix(phoneSuffix);
    if (!phoneValidation.valid || !idValidation.valid) {
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        if (!phoneValidation.valid) {
          newErrorMessages.push(phoneValidation.error);
        }
        if (!idValidation.valid) {
          newErrorMessages.push(idValidation.error);
        }
        return [...prevState, ...newErrorMessages];
      });
    } else {
      setIsFilled(true);
      handleClose();
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Edit Name
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit your personal details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            <label htmlFor="idNumber">ID Number</label>
            <input
              id="idNumber"
              onChange={(e) => setIdNumber(e.target.value)}
              type="text"
              placeholder="ID Number"
              value={idNumber}
            />
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              placeholder="First Name"
              value={firstName}
            />
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              placeholder="Last Name"
              value={lastName}
            />
            <label htmlFor="phone">Phone</label>{" "}
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
              placeholder="phone"
              value={phoneSuffix}
            />
            {errorMessages && (
              <ul>
                {errorMessages.map((error, id) => (
                  <li key={id} className="text-danger fw-bold">
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            disabled={!isFilled}
            onClick={(e) => {
              handleSubmit(e);
            }}
          >
            Save Changes
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default EditAccountModal;
