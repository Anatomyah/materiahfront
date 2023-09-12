import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { validatePhoneSuffix } from "../../config_and_helpers/helpers";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import { AppContext } from "../../App";
import { getUserDetails, updateUserProfile } from "../../clients/user_client";

const EditAccountModal = () => {
  const { token, userDetails, setUserDetails } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [isFilled, setIsFilled] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    setFirstName(userDetails.first_name);
    setLastName(userDetails.last_name);
    setEmail(userDetails.email);
    setPhonePrefix(userDetails.phone_prefix);
    setPhoneSuffix(userDetails.phone_suffix);
  }, [showModal]);

  useEffect(() => {
    setIsFilled(firstName && lastName && email && phonePrefix && phoneSuffix);
  }, [firstName, lastName, email, phonePrefix, phoneSuffix]);

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(true);
    setShowModal(false);
  };

  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);
    const emailInput = document.getElementById("email");
    const phoneValidation = validatePhoneSuffix(phoneSuffix);
    if (!phoneValidation.valid || !emailInput.checkValidity()) {
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        if (!emailInput.checkValidity()) {
          newErrorMessages.push("Invalid email format.");
        }
        if (!phoneValidation.valid) {
          newErrorMessages.push(phoneValidation.error);
        }
        return [...prevState, ...newErrorMessages];
      });
    } else {
      updateUserProfile(
        token,
        userDetails.user_id,
        {
          firstName,
          lastName,
          email,
          phonePrefix,
          phoneSuffix,
        },
        setUserDetails,
      ).then((response) => {
        if (!response) {
          handleClose();
        } else {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Edit product details
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit your personal details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            <label htmlFor="idNumber">ID Number</label>
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
            <input
              type="email"
              placeholder="Email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
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
