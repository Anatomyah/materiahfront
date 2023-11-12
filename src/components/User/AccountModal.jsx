import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { PHONE_PREFIX_CHOICES } from "../../config_and_helpers/config";
import {
  checkEmail,
  checkEmailAuthRequired,
  checkPhoneAuthRequired,
  checkPhoneNumber,
  checkUsername,
  checkUsernameAuthRequired,
  signup,
  updateUserProfile,
} from "../../clients/user_client";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import * as formik from "formik";
import * as yup from "yup";
import { Col, Form, Row } from "react-bootstrap";
import "font-awesome/css/font-awesome.min.css";
import "./UserComponentStyle.css";
import ShowPassword from "../Generic/ShowPassword";
import debounce from "lodash/debounce";

const createFormSchema = ({ isSignUp }) =>
  yup.object().shape({
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
      .test(
        "is-numeric",
        "Phone suffix must contain numbers only.",
        (value) => {
          return /^[0-9\s]+$/.test(value);
        },
      ),
    password: yup.string().when([], () => {
      return isSignUp
        ? yup
            .string()
            .required("Password is required")
            .min(8, "Password must be at least 8 characters long")
            .test(
              "uppercase",
              "Password must contain an uppercase letter",
              (value) => {
                return /[A-Z]/.test(value);
              },
            )
            .test(
              "letter-number-combo",
              "Password must contain both letters and numbers",
              (value) => {
                return /\d/.test(value) && /[a-zA-Z]/.test(value);
              },
            )
            .test(
              "specialChar",
              "Password must contain a special character",
              (value) => {
                return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
              },
            )
        : yup.string().notRequired();
    }),

    confirmPassword: yup.string().when("password", (password, schema) => {
      return isSignUp
        ? schema
            .required("Password confirmation is required")
            .oneOf([yup.ref("password"), null], "Passwords must match")
        : schema.notRequired();
    }),
  });

const AccountModal = ({ isSignUp = false }) => {
  const { token, setToken, userDetails, setUserDetails, setNotifications } =
    useContext(AppContext);
  const formSchema = createFormSchema({
    isSignUp,
  });
  const { Formik } = formik;
  const nav = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [isUsernameUnique, setIsUsernameUnique] = useState(true);
  const [username, setUsername] = useState(
    isSignUp ? "" : userDetails.username,
  );
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isEmailUnique, setIsEmailUnique] = useState(true);
  const [emailAddress, setEmailAddress] = useState(
    isSignUp ? "" : userDetails.email,
  );
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState(
    isSignUp ? "050" : userDetails.phone_prefix,
  );
  const [phoneSuffix, setPhoneSuffix] = useState(
    isSignUp ? "" : userDetails.phone_suffix,
  );
  const [isPhoneUnique, setIsPhoneUnique] = useState(true);

  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const checkmarkIcon = (
    <i className="fa fa-check-circle" style={{ color: "green" }}></i>
  );
  const invalidIcon = (
    <i className="fa fa-exclamation-circle" style={{ color: "red" }}></i>
  );

  const usernameUniqueValidator = {
    id: "unique",
    text: "Username is already taken.",
    validate: () => (isCheckingUsername ? true : isUsernameUnique),
  };

  const emailUniqueValidator = {
    id: "unique",
    text: "Email address already taken.",
    validate: () => (isCheckingEmail ? true : isEmailUnique),
  };

  const phoneUniqueValidator = {
    id: "unique",
    text: "Phone number already taken.",
    validate: () => (isCheckingPhone ? true : isPhoneUnique),
  };

  const validateSignUpPhone = async (prefix, suffix) => {
    const response = await checkPhoneNumber(prefix, suffix);
    setIsCheckingPhone(false);
    setIsPhoneUnique(response);
  };

  const validateEditPhone = async (prefix, suffix) => {
    const response = await checkPhoneAuthRequired(token, prefix, suffix);
    setIsCheckingPhone(false);
    setIsPhoneUnique(response);
  };

  const validateSignUpUsername = async (value) => {
    const response = await checkUsername(value);
    setIsCheckingUsername(false);
    setIsUsernameUnique(response);
  };

  const validateEditUsername = async (value) => {
    const response = await checkUsernameAuthRequired(token, value);
    setIsCheckingUsername(false);
    setIsUsernameUnique(response);
  };

  const validateSignUpEmail = async (value) => {
    const response = await checkEmail(value);
    setIsCheckingEmail(false);
    setIsEmailUnique(response);
  };

  const validateEditEmail = async (value) => {
    const response = await checkEmailAuthRequired(token, value);
    setIsCheckingEmail(false);
    setIsEmailUnique(response);
  };

  const debouncedCheckSignUpUsername = useCallback(
    debounce(validateSignUpUsername, 1500),
    [],
  );

  const debouncedCheckEditUsername = useCallback(
    debounce(validateEditUsername, 1500),
    [],
  );

  const debouncedCheckSignUpEmail = useCallback(
    debounce(validateSignUpEmail, 1500),
    [],
  );

  const debouncedCheckEditEmail = useCallback(
    debounce(validateEditEmail, 1500),
    [],
  );

  const debouncedCheckSignUpPhone = useCallback(
    debounce(validateSignUpPhone, 1500),
    [],
  );

  const debouncedCheckEditPhone = useCallback(
    debounce(validateEditPhone, 1500),
    [],
  );

  useEffect(() => {
    if (username && isSignUp) {
      debouncedCheckSignUpUsername(username);
    } else if (username && userDetails && username !== userDetails.username) {
      debouncedCheckSignUpUsername(username);
    } else {
      setIsCheckingUsername(false);
    }
  }, [username, debouncedCheckSignUpUsername, debouncedCheckEditUsername]);

  useEffect(() => {
    if (emailAddress && isSignUp) {
      debouncedCheckSignUpEmail(emailAddress);
    } else if (
      emailAddress &&
      userDetails &&
      emailAddress !== userDetails.email
    ) {
      debouncedCheckEditEmail(emailAddress);
    } else {
      setIsCheckingEmail(false);
    }
  }, [emailAddress, debouncedCheckSignUpEmail, debouncedCheckEditEmail]);

  useEffect(() => {
    if (phonePrefix && phoneSuffix && phoneSuffix.length === 7 && isSignUp) {
      debouncedCheckSignUpPhone(phonePrefix, phoneSuffix);
    } else if (
      phonePrefix &&
      phoneSuffix &&
      phoneSuffix.length === 7 &&
      userDetails &&
      (phonePrefix !== userDetails.phone_prefix ||
        phoneSuffix !== userDetails.phone_suffix)
    ) {
      debouncedCheckEditPhone(phonePrefix, phoneSuffix);
    } else {
      setIsCheckingPhone(false);
    }
  }, [
    phonePrefix,
    phoneSuffix,
    userDetails,
    debouncedCheckEditPhone,
    debouncedCheckSignUpPhone,
  ]);

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
      userprofile: {
        phone_prefix: values.phonePrefix,
        phone_suffix: values.phoneSuffix,
      },
    };

    if (isSignUp) {
      userData.password = values.password;
    }

    const accountPromise =
      isSignUp !== false
        ? signup(userData, setToken, setUserDetails, setNotifications)
        : updateUserProfile(
            token,
            userDetails.user_id,
            userData,
            setUserDetails,
          );

    accountPromise.then((response) => {
      if (response && response.success) {
        handleClose();
        if (isSignUp) {
          nav("/");
        }
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  return (
    <>
      <Button variant={isSignUp ? "link" : "primary"} onClick={handleShow}>
        {isSignUp ? "Signup to Materiah" : "Edit Account Details"}
      </Button>

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {isSignUp ? "Enter User Details" : "Edit Account Details"}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            username: !isSignUp ? userDetails.username : "",
            email: !isSignUp ? userDetails.email : "",
            firstName: !isSignUp ? userDetails.first_name : "",
            lastName: !isSignUp ? userDetails.last_name : "",
            phonePrefix: !isSignUp ? userDetails.phone_prefix : "050",
            phoneSuffix: !isSignUp ? userDetails.phone_suffix : "",
            password: "",
            confirmPassword: "",
          }}
          initialTouched={
            !isSignUp
              ? {
                  username: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  phonePrefix: true,
                  phoneSuffix: true,
                }
              : {}
          }
          validateOnMount={isSignUp ? false : true}
          enableReinitialize={true}
          validationSchema={formSchema}
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
            setFieldValue,
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
                      onChange={(event) => {
                        const { value } = event.target;
                        setUsername(value);
                        setIsCheckingUsername(true);
                        setFieldValue("username", value);
                      }}
                      onFocus={() => setFieldTouched("username", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.username && !!errors.username) ||
                        !usernameUniqueValidator.validate()
                      }
                      isValid={
                        touched.username &&
                        !errors.username &&
                        usernameUniqueValidator.validate() &&
                        !isCheckingUsername
                      }
                    />
                    {usernameUniqueValidator.validate() &&
                      !isCheckingUsername && (
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                      )}
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                      {!usernameUniqueValidator.validate() &&
                        !isCheckingUsername &&
                        usernameUniqueValidator.text}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {isCheckingUsername
                        ? "Checking..."
                        : "150 characters or fewer. Letters, digits and @.+-_ only."}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group controlId="signupEmail" className="field-margin">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="email"
                      value={values.email}
                      onChange={(event) => {
                        const { value } = event.target;
                        setIsCheckingEmail(true);
                        setEmailAddress(value);
                        setFieldValue("email", value);
                      }}
                      onFocus={() => setFieldTouched("email", true)}
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.email && !!errors.email) ||
                        !emailUniqueValidator.validate()
                      }
                      isValid={
                        touched.email &&
                        !errors.email &&
                        emailUniqueValidator.validate() &&
                        !isCheckingEmail
                      }
                    />
                    {emailUniqueValidator.validate() && !isCheckingEmail && (
                      <Form.Control.Feedback type="valid">
                        Looks good!
                      </Form.Control.Feedback>
                    )}
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                      {!emailUniqueValidator.validate() &&
                        !isCheckingEmail &&
                        emailUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingEmail && <Form.Text>Checking...</Form.Text>}
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
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Group as={Col} md="3" controlId="signupPhonePrefix">
                      <Form.Select
                        name="phonePrefix"
                        value={values.phonePrefix}
                        onChange={(event) => {
                          const { value } = event.target;
                          setIsCheckingPhone(true);
                          setPhonePrefix(value);
                          setFieldValue("phonePrefix", value);
                        }}
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
                      <Form.Control
                        type="text"
                        name="phoneSuffix"
                        value={values.phoneSuffix}
                        onChange={(event) => {
                          const { value } = event.target;
                          setIsCheckingPhone(true);
                          setPhoneSuffix(value);
                          setFieldValue("phoneSuffix", value);
                        }}
                        onFocus={() => setFieldTouched("phoneSuffix", true)}
                        onBlur={handleBlur}
                        isInvalid={
                          (touched.phoneSuffix && !!errors.phoneSuffix) ||
                          !phoneUniqueValidator.validate()
                        }
                        isValid={
                          touched.phoneSuffix &&
                          !errors.phoneSuffix &&
                          phoneUniqueValidator.validate() &&
                          !isCheckingPhone
                        }
                      />
                      <Form.Control.Feedback type="valid">
                        Looks good!
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        {errors.phoneSuffix}
                        {!phoneUniqueValidator.validate() &&
                          !isCheckingPhone &&
                          phoneUniqueValidator.text}
                      </Form.Control.Feedback>
                      {isCheckingPhone && <Form.Text>Checking...</Form.Text>}
                    </Form.Group>
                  </Row>
                  {isSignUp && (
                    <>
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
                          onFocus={() =>
                            setFieldTouched("confirmPassword", true)
                          }
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
                    </>
                  )}

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
                    disabled={
                      !isValid ||
                      (isSignUp && !dirty) ||
                      !usernameUniqueValidator.validate() ||
                      !emailUniqueValidator.validate() ||
                      isCheckingEmail ||
                      isCheckingUsername ||
                      !phoneUniqueValidator.validate() ||
                      isCheckingPhone
                    }
                    onClick={handleSubmit}
                  >
                    {isSignUp ? "Signup" : "Save"}
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
export default AccountModal;
