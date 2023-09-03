import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { validateId, validatePhoneSuffix } from "../helpers";
import { PHONE_PREFIX_CHOICES } from "../config";
import { AppContext } from "../App";

const EditAccountModal = ({ details }) => {
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [isFilled, setIsFilled] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const [contactEmail, setContactEmail] = useState();
  const [contactPhonePrefix, setContactPhonePrefix] = useState();
  const [contactPhoneSuffix, setContactPhoneSuffix] = useState();

  useEffect(() => {
    setFirstName(details.first_name);
    setLastName(details.last_name);
    setEmail(details.email);
    setPhonePrefix(details.phone_prefix);
    setPhoneSuffix(details.phone_suffix);
    setContactEmail(details.contact_email);
    setContactPhonePrefix(details.contact_phone_prefix);
    setContactPhoneSuffix(details.contact_phone_suffix);
  }, [showModal]);

  useEffect(() => {
    setIsFilled(
      firstName &&
        lastName &&
        email &&
        phonePrefix &&
        phoneSuffix &&
        contactEmail &&
        contactPhonePrefix &&
        contactPhoneSuffix,
    );
  }, [
    firstName,
    lastName,
    email,
    contactEmail,
    phonePrefix,
    phoneSuffix,
    contactPhonePrefix,
    contactPhoneSuffix,
  ]);
  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(true);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email");
    const contactEmailInput = document.getElementById("contact_email");
    const phoneValidation = validatePhoneSuffix(phoneSuffix);
    const contactPhoneValidation = validatePhoneSuffix(contactPhoneSuffix);

    if (
      !emailInput.checkValidity() ||
      !contactEmailInput.checkValidity() ||
      !phoneValidation.valid ||
      !contactPhoneValidation.valid
    ) {
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        if (!emailInput.checkValidity()) {
          newErrorMessages.push("Invalid office email format.");
        }
        if (!contactEmailInput.checkValidity()) {
          newErrorMessages.push("Invalid contact email format.");
        }
        if (!phoneValidation.valid) {
          newErrorMessages.push(`Office phone: ${phoneValidation.error}`);
        }
        if (!contactPhoneValidation.valid) {
          newErrorMessages.push(
            `Contact phone: ${contactPhoneValidation.error}`,
          );
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
        Edit details
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit your personal details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
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
              placeholder="Office Email"
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
              placeholder="Office Phone"
              value={phoneSuffix}
            />
            <input
              type="email"
              placeholder="Contact Email"
              id="contact_email"
              onChange={(e) => setContactEmail(e.target.value)}
              value={contactEmail}
            />
            <label htmlFor="contact_phone">Phone</label>{" "}
            <select
              value={contactPhonePrefix}
              onChange={(e) => setContactPhonePrefix(e.target.value)}
            >
              {PHONE_PREFIX_CHOICES.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <input
              id="contact_phone"
              onChange={(e) => setContactPhoneSuffix(e.target.value)}
              type="text"
              placeholder="Contact Phone"
              value={contactPhoneSuffix}
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
