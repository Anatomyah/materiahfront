import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { validatePhoneSuffix } from "../../config_and_helpers/helpers";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import { login, signup } from "../../clients/user_client";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";

const SignupModal = () => {
  const { setToken, setUserDetails } = useContext(AppContext);
  const nav = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("050");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    setIsFilled(
      username &&
        email &&
        firstName &&
        lastName &&
        phoneSuffix &&
        password &&
        confirmPassword,
    );
  }, [
    username,
    email,
    firstName,
    lastName,
    phoneSuffix,
    password,
    confirmPassword,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);
    const emailInput = document.getElementById("email");
    const phoneValidation = validatePhoneSuffix(phoneSuffix);
    if (
      !emailInput.checkValidity() ||
      !phoneValidation.valid ||
      password !== confirmPassword
    ) {
      setIsFilled(false);
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        if (!emailInput.checkValidity()) {
          newErrorMessages.push("Invalid email format.");
        }
        if (!phoneValidation.valid) {
          newErrorMessages.push(phoneValidation.error);
        }
        if (password !== confirmPassword) {
          newErrorMessages.push("Passwords do not match.");
        }
        return [...prevState, ...newErrorMessages];
      });
    } else {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("password", password);
      formData.append("confirm_password", confirmPassword);
      formData.append("phone_prefix", phonePrefix);
      formData.append("phone_suffix", phoneSuffix);

      signup(formData).then((response) => {
        if (response && response.success) {
          login({ username, password }, setToken, setUserDetails).then(
            (response) => {
              if (!response) {
                handleClose();
                nav("/");
              } else {
                setErrorMessages((prevState) => [...prevState, response]);
              }
            },
          );
        } else {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  };

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Signup to Materiah
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit your personal details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            className="form-control"
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            <legend>Signup</legend>
            <input
              type="text"
              placeholder="Username"
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
            <input
              type="email"
              placeholder="Email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input
              type="text"
              placeholder="First Name"
              id="first_name"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
            <input
              type="text"
              placeholder="Last Name"
              id="last_name"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
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
              placeholder="phone"
              value={phoneSuffix}
            />
            <input
              id="password_1"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              value={password}
            />
            <input
              id="password_2"
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
            />
            {!errorMessages && (
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
            Signup
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default SignupModal;
