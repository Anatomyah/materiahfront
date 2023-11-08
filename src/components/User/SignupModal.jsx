import React, { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import { login, signup } from "../../clients/user_client";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import * as formik from "formik";
import * as yup from "yup";
import { Col, Form, Row } from "react-bootstrap";
import "font-awesome/css/font-awesome.min.css";
import "./UserComponentStyle.css";
import ShowPassword from "../Generic/ShowPassword";

const schema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .test("is-english", "Username must be in English", (value) => {
      return /^[a-zA-Z0-9\s]+$/.test(value);
    }),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  firstName: yup
    .string()
    .required("First name is required")
    .test(
      "is-english",
      "First name must be in English and contain letters only.",
      (value) => {
        return /^[a-zA-Z\s]+$/.test(value);
      },
    ),
  lastName: yup
    .string()
    .required("Last name is required")
    .test(
      "is-english",
      "Last name must be in English and contain letters only.",
      (value) => {
        return /^[a-zA-Z\s]+$/.test(value);
      },
    ),
  phonePrefix: yup.string().required("Phone prefix is required"),
  phoneSuffix: yup
    .string()
    .length(7, "Phone suffix must be 7 digits long")
    .required("Phone suffix is required")
    .test("is-numeric", "Phone suffix must contain numbers only.", (value) => {
      return /^[0-9\s]+$/.test(value);
    }),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "null")
    .test("uppercase", "null", (value) => {
      return /[A-Z]/.test(value);
    })
    .test("letter-number-combo", "null", (value) => {
      return /\d/.test(value) && /[a-zA-Z]/.test(value);
    })
    .test("specialChar", "null", (value) => {
      return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
    }),
  confirmPassword: yup
    .string()
    .required("Password confirmation is required")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const SignupModal = () => {
  const { setToken, setUserDetails, setNotifications } = useContext(AppContext);
  const nav = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  //
  const { Formik } = formik;
  const [showPasswords, setShowPasswords] = useState(false);

  const checkmarkIcon = (
    <i className="fa fa-check-circle" style={{ color: "green" }}></i>
  );
  const invalidIcon = (
    <i className="fa fa-exclamation-circle" style={{ color: "red" }}></i>
  );

  const passwordRequirements = [
    {
      id: "length",
      text: "Must be at least 8 characters long.",
      validate: (password) => password.length >= 8,
    },
    {
      id: "uppercase",
      text: "Must contain an uppercase letter.",
      validate: (password) => /[A-Z]/.test(password),
    },
    {
      id: "number",
      text: "Must contain a number.",
      validate: (password) => /\d/.test(password),
    },
    {
      id: "specialChar",
      text: "Must contain a special character.",
      validate: (password) =>
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
    },
  ];

  const handleClose = () => {
    setErrorMessages([]);
    setShowModal(false);
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

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Enter user details</Modal.Title>
        </Modal.Header>

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
          validationSchema={schema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            handleBlur,
            touched,
            errors,
            setFieldTouched,
            isValid,
            dirty,
          }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body className="d-flex flex-column p-4">
                  <Form.Group
                    controlId="signupUsername"
                    className="field-margin"
                  >
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("username", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.username && !!errors.username}
                      isValid={touched.username && !errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      150 characters or fewer. Letters, digits and @.+-_ only.
                    </Form.Text>
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group controlId="signupEmail" className="field-margin">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("email", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.email && !!errors.email}
                      isValid={touched.email && !errors.email}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="signupFirstName"
                    className="field-margin"
                  >
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("firstName", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.firstName && !!errors.firstName}
                      isValid={touched.firstName && !errors.firstName}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    controlId="signupLastName"
                    className="field-margin"
                  >
                    <Form.Label>Last name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("lastName", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.lastName && !!errors.lastName}
                      isValid={touched.lastName && !errors.lastName}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Row className="field-margin">
                    <Form.Group as={Col} md="3" controlId="signupPhonePrefix">
                      <Form.Label>Phone prefix</Form.Label>
                      <Form.Select
                        name="phonePrefix"
                        value={values.phonePrefix}
                        onChange={handleChange}
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
                    <Form.Group as={Col} md="9" controlId="signupPhoneSuffix">
                      <Form.Label>Phone Suffix</Form.Label>
                      <Form.Control
                        type="text"
                        name="phoneSuffix"
                        value={values.phoneSuffix}
                        onChange={handleChange}
                        onFocus={() => setFieldTouched("phoneSuffix", true)}
                        onBlur={handleBlur}
                        isInvalid={touched.phoneSuffix && !!errors.phoneSuffix}
                        isValid={touched.phoneSuffix && !errors.phoneSuffix}
                      />
                      <Form.Control.Feedback type="valid">
                        Looks good!
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        {errors.phoneSuffix}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Form.Group controlId="signupPassword">
                    <div className="d-flex flex-row">
                      <Form.Label className="me-2">Password </Form.Label>
                      <Form.Label>
                        <ShowPassword
                          showPassword={showPasswords}
                          setShowPassword={setShowPasswords}
                        />
                      </Form.Label>
                    </div>
                    <Form.Control
                      type={showPasswords ? "text" : "password"}
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("password", true)}
                      onBlur={handleBlur}
                      isInvalid={touched.password && !!errors.password}
                      isValid={touched.password && !errors.password}
                      className="field-margin"
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.password === "Password is required"
                        ? errors.password
                        : null}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      <div className="w-auto">
                        <ul>
                          {passwordRequirements.map((req) => (
                            <li key={req.id}>
                              {req.validate(values.password)
                                ? checkmarkIcon
                                : invalidIcon}{" "}
                              {req.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Form.Text>
                  </Form.Group>
                  <Form.Group controlId="signupConfirmPassword">
                    <Form.Label>Confirm password</Form.Label>
                    <Form.Control
                      type={showPasswords ? "text" : "password"}
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFieldTouched("confirmPassword", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.confirmPassword && !!errors.confirmPassword
                      }
                      isValid={
                        touched.confirmPassword && !errors.confirmPassword
                      }
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                  {Object.keys(errorMessages).length > 0 && (
                    <ul>
                      {Object.keys(errorMessages).map((key, index) => {
                        return errorMessages[key].map((error, subIndex) => (
                          <li
                            key={`${index}-${subIndex}`}
                            className="text-danger fw-bold"
                          >
                            {error}
                          </li>
                        ));
                      })}
                    </ul>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="primary"
                    disabled={!isValid || !dirty}
                    onClick={handleSubmit}
                  >
                    Signup
                  </Button>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </>
  );
};
export default SignupModal;
