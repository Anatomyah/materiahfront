import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { validatePhoneSuffix } from "../../config_and_helpers/helpers";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import { AppContext } from "../../App";
import {
  updateSupplierProfile,
  updateUserProfile,
} from "../../clients/user_client";

const EditSupplierAccountModal = () => {
  const { token, userDetails, setUserDetails } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhonePrefix, setSupplierPhonePrefix] = useState("");
  const [supplierPhoneSuffix, setSupplierPhoneSuffix] = useState("");
  const [supplierWebsite, setSupplierWebsite] = useState("");
  const [isFilled, setIsFilled] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    setFirstName(userDetails.first_name);
    setLastName(userDetails.last_name);
    setEmail(userDetails.email);
    setPhonePrefix(userDetails.phone_prefix);
    setPhoneSuffix(userDetails.phone_suffix);
    setSupplierEmail(userDetails.supplier_email);
    setSupplierPhonePrefix(userDetails.supplier_phone_prefix);
    setSupplierPhoneSuffix(userDetails.supplier_phone_suffix);
    setSupplierWebsite(userDetails.supplier_website);
  }, [showModal]);

  useEffect(() => {
    setIsFilled(
      firstName &&
        lastName &&
        email &&
        phonePrefix &&
        phoneSuffix &&
        supplierEmail &&
        supplierPhonePrefix &&
        supplierPhoneSuffix,
    );
  }, [
    firstName,
    lastName,
    email,
    supplierEmail,
    phonePrefix,
    phoneSuffix,
    supplierPhonePrefix,
    supplierPhoneSuffix,
  ]);
  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(true);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);
    const supplierEmailInput = document.getElementById("contact_email");
    const contactEmailInput = document.getElementById("supplier_email");
    const phoneValidation = validatePhoneSuffix(phoneSuffix);
    const contactPhoneValidation = validatePhoneSuffix(supplierPhoneSuffix);

    if (
      !supplierEmailInput.checkValidity() ||
      !contactEmailInput.checkValidity() ||
      !phoneValidation.valid ||
      !contactPhoneValidation.valid
    ) {
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        if (!supplierEmailInput.checkValidity()) {
          newErrorMessages.push("Invalid office email format.");
        }
        if (!contactEmailInput.checkValidity()) {
          newErrorMessages.push("Invalid contact email format.");
        }
        if (!phoneValidation.valid) {
          newErrorMessages.push(`Supplier phone: ${phoneValidation.error}`);
        }
        if (!contactPhoneValidation.valid) {
          newErrorMessages.push(
            `Contact phone: ${contactPhoneValidation.error}`,
          );
        }
        return [...prevState, ...newErrorMessages];
      });
    } else {
      updateSupplierProfile(token, userDetails.supplier_id, {
        supplierEmail,
        supplierPhonePrefix,
        supplierPhoneSuffix,
        supplierWebsite,
      }).then((response) => {
        if (!response) {
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
            true,
          ).then((response) => {
            if (!response) {
              handleClose();
            } else {
              setErrorMessages((prevState) => [...prevState, response]);
            }
          });
        } else {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
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
            <legend>Supplier contact details</legend>
            <label htmlFor="firstName">First Name</label>
            <input
              id="first_name"
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              placeholder="Contact First Name"
              value={firstName}
            />
            <label htmlFor="lastName">Last Name</label>
            <input
              id="last_name"
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              placeholder="Contact Last Name"
              value={lastName}
            />
            <input
              type="email"
              placeholder="Contact Email"
              id="contact_email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <label htmlFor="phone">Phone</label>
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
              placeholder="Contact Phone"
              value={phoneSuffix}
            />
            <legend>Supplier details:</legend>
            <br />
            <input
              type="email"
              placeholder="Supplier email for quotes"
              id="supplier_email"
              onChange={(e) => setSupplierEmail(e.target.value)}
              value={supplierEmail}
            />
            <label htmlFor="supplier_phone">Phone</label>{" "}
            <select
              value={supplierPhonePrefix}
              onChange={(e) => setSupplierPhonePrefix(e.target.value)}
            >
              {PHONE_PREFIX_CHOICES.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <input
              id="supplier_phone"
              onChange={(e) => setSupplierPhoneSuffix(e.target.value)}
              type="text"
              placeholder="Supplier office phone"
              value={supplierPhoneSuffix}
            />
            <input
              id="supplier_website"
              onChange={(e) => setSupplierWebsite(e.target.value)}
              type="url"
              placeholder="Supplier Website URL"
              value={supplierWebsite}
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
export default EditSupplierAccountModal;
