import React, { useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  checkEmail,
  getPasswordToken,
  resetPassword,
} from "../../clients/user_client";
import * as yup from "yup";
import { Form } from "react-bootstrap";
import ShowPassword from "../Generic/ShowPassword";
import { Formik } from "formik";
import debounce from "lodash/debounce";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  token: yup.string().required("Token is required"),
  newPassword: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .test("uppercase", "Password must contain an uppercase letter", (value) =>
      /[A-Z]/.test(value),
    )
    .test(
      "letter-number-combo",
      "Password must contain both letters and numbers",
      (value) => /\d/.test(value) && /[a-zA-Z]/.test(value),
    )
    .test("specialChar", "Password must contain a special character", (value) =>
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value),
    ),

  confirmPassword: yup
    .string()
    .required("Password confirmation is required")
    .oneOf([yup.ref("newPassword"), null], "Passwords must match"),
});

const ChangePasswordModal = ({ userEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(
    userEmail ? userEmail : "",
  );
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(true);
  const [tokenSent, setTokenSent] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const checkmarkIcon = (
    <i className="fa fa-check-circle" style={{ color: "green" }}></i>
  );
  const invalidIcon = (
    <i className="fa fa-exclamation-circle" style={{ color: "red" }}></i>
  );

  const emailExistingValidator = {
    id: "unique",
    text: "This Email address does not exist in our database.",
    validate: () => (isCheckingEmail ? true : emailExists),
  };

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

  const validateRecoveryEmail = async (value) => {
    const response = await checkEmail(value);
    setIsCheckingEmail(false);
    setEmailExists(!response);
  };

  const debouncedCheckRecoveryEmail = useCallback(
    debounce((value) => {
      if (value && value.length > 0) {
        validateRecoveryEmail(value);
      }
    }, 1500),
    [],
  );

  useEffect(() => {
    if (recoveryEmail && !userEmail) {
      debouncedCheckRecoveryEmail(recoveryEmail);
      setIsCheckingEmail(true);
    } else {
      setIsCheckingEmail(false);
    }
  }, [recoveryEmail, debouncedCheckRecoveryEmail]);

  const fetchPasswordToken = () => {
    getPasswordToken(recoveryEmail).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
        //   todo - present email sending error - modal? toast? message?
      }
      if (response && response.success) {
        if (userEmail) {
          setShowModal(true);
        } else {
          setTokenSent(true);
        }
      }
    });
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleShow = () => {
    if (userEmail) {
      fetchPasswordToken();
    } else {
      setShowModal(true);
    }
  };

  const handleSubmit = (values) => {
    resetPassword(values.token, values.newPassword).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      } else {
        handleClose();
      }
    });
  };

  return (
    <>
      <Button variant={userEmail ? "primary" : "link"} onClick={handleShow}>
        {userEmail ? "Change Password" : "Forgot your password?"}
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change Your Password</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            email: "",
            token: "",
            newPassword: "",
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
            setFieldValue,
          }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body className="d-flex flex-column p-4">
                  {!tokenSent ? (
                    <>
                      <Form.Group
                        controlId="recoveryEmail"
                        className="field-margin"
                      >
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="email"
                          value={values.email}
                          onChange={(event) => {
                            const { value } = event.target;
                            setRecoveryEmail(value);
                            setFieldValue("email", value);
                          }}
                          onFocus={() => setFieldTouched("email", true)}
                          onBlur={handleBlur}
                          isInvalid={
                            (touched.email && !!errors.email) ||
                            !emailExistingValidator.validate()
                          }
                          isValid={
                            touched.email &&
                            !errors.email &&
                            emailExistingValidator.validate() &&
                            !isCheckingEmail
                          }
                        />
                        {emailExistingValidator.validate() &&
                          !isCheckingEmail && (
                            <Form.Control.Feedback type="valid">
                              Looks good!
                            </Form.Control.Feedback>
                          )}
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                          {!emailExistingValidator.validate() &&
                            !isCheckingEmail &&
                            emailExistingValidator.text}
                        </Form.Control.Feedback>
                        <Form.Text>
                          {isCheckingEmail
                            ? "Checking..."
                            : "Please enter your email address below. Once it's identified a token will be sent your way"}
                        </Form.Text>
                      </Form.Group>
                      <Button
                        disabled={
                          !emailExistingValidator.validate() || isCheckingEmail
                        }
                        onClick={fetchPasswordToken}
                      >
                        Send Token
                      </Button>
                    </>
                  ) : (
                    <>
                      <Form.Group
                        controlId="resetToken"
                        className="field-margin"
                      >
                        <Form.Label>Token</Form.Label>
                        <Form.Control
                          type="text"
                          name="token"
                          value={values.token}
                          onChange={handleChange}
                          onFocus={() => setFieldTouched("token", true)}
                          onBlur={handleBlur}
                          isInvalid={touched.token && !!errors.token}
                          isValid={touched.token && !errors.token}
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.token}
                        </Form.Control.Feedback>
                      </Form.Group>
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
                          name="newPassword"
                          value={values.newPassword}
                          onChange={handleChange}
                          onFocus={() => setFieldTouched("newPassword", true)}
                          onBlur={handleBlur}
                          isInvalid={
                            touched.newPassword && !!errors.newPassword
                          }
                          isValid={touched.newPassword && !errors.newPassword}
                          className="field-margin"
                        />
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          {errors.newPassword === "Password is required"
                            ? errors.newPassword
                            : null}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          <div className="w-auto">
                            <ul>
                              {passwordRequirements.map((req) => (
                                <li key={req.id}>
                                  {req.validate(values.newPassword)
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
                {tokenSent && (
                  <Modal.Footer>
                    <Button
                      variant="primary"
                      disabled={!isValid || !dirty}
                      onClick={handleSubmit}
                    >
                      Reset Password
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                      Close
                    </Button>
                  </Modal.Footer>
                )}
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </>
  );
};

export default ChangePasswordModal;
