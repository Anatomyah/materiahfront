import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import { login, signup } from "../../clients/user_client";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import * as formik from "formik";
import * as yup from "yup";
import { Col, Form, Row } from "react-bootstrap";

const schema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  phonePrefix: yup.string().required("Phone prefix is required"),
  phoneSuffix: yup
    .string()
    .length(7, "Phone suffix must be 7 digits long")
    .required("Phone suffix is required"),
  password: yup.string().required("Password is required"),
  confirmPassword: yup
    .string()
    .required("Password confirmation is required")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

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
  const { Formik } = formik;

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

  const handleSubmit = (values) => {
    setErrorMessages([]);

    const userData = {
      username: values.username,
      email: values.email,
      first_name: values.firstName,
      last_name: values.lastName,
      password: values.password,
      userprofile: {
        phone_prefix: values.phonePrefix,
        phone_suffix: values.phoneSuffix,
      },
    };
    signup(userData).then((response) => {
      if (response && response.success) {
        login({
          credentials: { username: values.username, password: values.password },
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
  };

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Signup to Materiah
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Enter user details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column align-items-center">
          <Formik
            initialValues={{
              username: "",
              email: "",
              firstName: "",
              lastName: "",
              phonePrefix: "050",
              phoneSuffix: "",
              password: "",
              confirmPassword: "",
            }}
            onSubmit={(values) => {
              handleSubmit(values);
            }}
          >
            {({ handleSubmit, handleChange, values, touched, errors }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Row>
                  <Form.Group as={Col} md="4" controlId="signupUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      isInvalid={!!errors.username}
                      isValid={!errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md="4" controlId="signupEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      isValid={!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} md="4" controlId="signupFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      isInvalid={!!errors.firstName}
                      isValid={!errors.firstName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md="4" controlId="signupLastName">
                    <Form.Label>Last name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      isInvalid={!!errors.lastName}
                      isValid={!errors.lastName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} md="4" controlId="signupPhonePrefix">
                    <Form.Label>Phone prefix</Form.Label>
                    <Form.Select
                      name="phonePrefix"
                      value={values.phonePrefix}
                      onChange={handleChange}
                      isInvalid={!!errors.phonePrefix}
                    >
                      {PHONE_PREFIX_CHOICES.map((choice, index) => (
                        <option key={index} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.phonePrefix}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md="4" controlId="signupPhoneSuffix">
                    <Form.Label>Phone Suffix</Form.Label>
                    <Form.Control
                      type="text"
                      name="phoneSuffix"
                      value={values.phoneSuffix}
                      onChange={handleChange}
                      isInvalid={!!errors.phoneSuffix}
                      isValid={!errors.phoneSuffix}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phoneSuffix}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} md="4" controlId="signupPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="text"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      isValid={!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md="4" controlId="signupConfirmPassword">
                    <Form.Label>Confirm password</Form.Label>
                    <Form.Control
                      type="text"
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                      isValid={!errors.confirmPassword}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
              </Form>
            )}
          </Formik>

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
