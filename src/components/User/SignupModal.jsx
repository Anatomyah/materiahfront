import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import { login, signup } from "../../clients/user_client";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";

const SignupModal = () => {
  const { setToken, setUserDetails, setNotifications } = useContext(AppContext);
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("050");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
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

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
  };

  const resetModal = () => {
    setUsername("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhonePrefix("050");
    setPhoneSuffix("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);
    const emailValidation = document.getElementById("email").checkValidity();
    const phoneValidation = phoneSuffix.length === 7;

    if (!emailValidation || !phoneValidation || password !== confirmPassword) {
      setIsFilled(false);
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
        if (password !== confirmPassword) {
          newErrorMessages.push("Passwords do not match.");
        }
        return [...prevState, ...newErrorMessages];
      });
    } else {
      const userData = {
        username: username,
        email: email,
        first_name: firstName,
        last_name: lastName,
        password: password,
        userprofile: {
          phone_prefix: phonePrefix,
          phone_suffix: phoneSuffix,
        },
      };
      signup(userData).then((response) => {
        if (response && response.success) {
          login({
            credentials: { username: username, password: password },
            setToken: setToken,
            setUserDetails: setUserDetails,
            setNotifications: setNotifications,
          }).then((response) => {
            if (response && response.success) {
              handleClose();
              nav("/");
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
              onKeyPress={(e) => {
                if (e.key.match(/[^0-9]/)) {
                  e.preventDefault();
                }
              }}
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
