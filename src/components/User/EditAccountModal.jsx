import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import { AppContext } from "../../App";
import { updateUserProfile } from "../../clients/user_client";

const EditAccountModal = () => {
  const { token, userDetails, setUserDetails } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState(userDetails.first_name);
  const [lastName, setLastName] = useState(userDetails.last_name);
  const [email, setEmail] = useState(userDetails.email);
  const [phonePrefix, setPhonePrefix] = useState(userDetails.phone_prefix);
  const [phoneSuffix, setPhoneSuffix] = useState(userDetails.phone_suffix);
  const [isFilled, setIsFilled] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);

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
    const emailValidation = document.getElementById("email").checkValidity();
    const phoneValidation = phoneSuffix.length === 7;

    if (!phoneValidation || !emailValidation) {
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        if (!emailValidation) {
          newErrorMessages.push("Invalid email format.");
        }
        if (!phoneValidation) {
          newErrorMessages.push(
            "Phone suffix should be exactly 7 digits long.",
          );
        }
        return [...prevState, ...newErrorMessages];
      });
    } else {
      const updatedData = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        userprofile: {
          phone_prefix: phonePrefix,
          phone_suffix: phoneSuffix,
        },
      };
      updateUserProfile(
        token,
        userDetails.user_id,
        updatedData,
        setUserDetails,
      ).then((response) => {
        if (response && response.success) {
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
              onKeyPress={(e) => {
                if (e.key.match(/[^0-9]/)) {
                  e.preventDefault();
                }
              }}
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
