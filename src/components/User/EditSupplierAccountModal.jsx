import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import { AppContext } from "../../App";
import { updateUserProfile } from "../../clients/user_client";
import { updateSupplier } from "../../clients/supplier_client";

const EditSupplierAccountModal = () => {
  const { token, userDetails, setUserDetails } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState(userDetails.first_name);
  const [lastName, setLastName] = useState(userDetails.last_name);
  const [email, setEmail] = useState(userDetails.email);
  const [contactPhonePrefix, setContactPhonePrefix] = useState(
    userDetails.phone_prefix,
  );
  const [contactPhoneSuffix, setContactPhoneSuffix] = useState(
    userDetails.phone_suffix,
  );
  const [supplierEmail, setSupplierEmail] = useState(
    userDetails.supplier_email,
  );
  const [supplierPhonePrefix, setSupplierPhonePrefix] = useState(
    userDetails.supplier_phone_prefix,
  );
  const [supplierPhoneSuffix, setSupplierPhoneSuffix] = useState(
    userDetails.supplier_phone_suffix,
  );
  const [supplierWebsite, setSupplierWebsite] = useState(
    userDetails.supplier_website,
  );
  const [isFilled, setIsFilled] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    setIsFilled(
      firstName &&
        lastName &&
        email &&
        contactPhonePrefix &&
        contactPhoneSuffix &&
        supplierEmail &&
        supplierPhonePrefix &&
        supplierPhoneSuffix,
    );
  }, [
    firstName,
    lastName,
    email,
    supplierEmail,
    contactPhonePrefix,
    contactPhoneSuffix,
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
    const supplierEmailValidation = document
      .getElementById("contact_email")
      .checkValidity();
    const contactEmailValidation = document
      .getElementById("supplier_email")
      .checkValidity();
    const phoneValidation = contactPhoneSuffix.length === 7;
    const contactPhoneValidation = supplierPhoneSuffix.length === 7;

    if (
      !supplierEmailValidation ||
      !contactEmailValidation ||
      !phoneValidation ||
      !contactPhoneValidation
    ) {
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        if (!supplierEmailValidation) {
          newErrorMessages.push("Invalid office email format.");
        }
        if (!contactEmailValidation) {
          newErrorMessages.push("Invalid contact email format.");
        }
        if (!phoneValidation) {
          newErrorMessages.push(
            `Supplier phone: Phone suffix should be exactly 7 digits long.`,
          );
        }
        if (!contactPhoneValidation) {
          newErrorMessages.push(
            `Contact phone: Phone suffix should be exactly 7 digits long.`,
          );
        }
        return [...prevState, ...newErrorMessages];
      });
    } else {
      updateUserProfile(
        token,
        userDetails.user_id,
        {
          email: email,
          first_name: firstName,
          last_name: lastName,
          supplieruserprofile: {
            contact_phone_prefix: contactPhonePrefix,
            contact_phone_suffix: contactPhoneSuffix,
          },
          supplier_data: {
            supplier_id: userDetails.supplier_id,
            email: supplierEmail,
            phone_prefix: supplierPhonePrefix,
            phone_suffix: supplierPhoneSuffix,
            website: supplierWebsite,
          },
        },
        setUserDetails,
        true,
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
              id="phone"
              onChange={(e) => setContactPhoneSuffix(e.target.value)}
              type="text"
              placeholder="Contact Phone"
              value={contactPhoneSuffix}
              onKeyPress={(e) => {
                if (e.key.match(/[^0-9]/)) {
                  e.preventDefault();
                }
              }}
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
              onKeyPress={(e) => {
                if (e.key.match(/[^0-9]/)) {
                  e.preventDefault();
                }
              }}
            />
            <input
              id="supplier_website"
              onChange={(e) => setSupplierWebsite(e.target.value)}
              type="url"
              placeholder="Supplier Website URL"
              value={supplierWebsite}
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
export default EditSupplierAccountModal;
