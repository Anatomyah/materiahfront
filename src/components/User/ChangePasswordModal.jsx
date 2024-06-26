import React, { useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  checkEmail,
  getPasswordToken,
  resetPassword,
} from "../../clients/user_client";
import * as yup from "yup";
import { Form, Spinner } from "react-bootstrap";
import ShowPassword from "../Generic/ShowPassword";
import { Formik } from "formik";
import debounce from "lodash/debounce";
import { showToast } from "../../config_and_helpers/helpers";

// Yup schema for the change password Formik form
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

/**
 * Provides a modal form for users to change their password.
 * Users can either supply their account email, or use the prepopulated email if it's supplied as a prop.
 * They need to verify that their account email exists, then they are sent a token.
 * They input this token in the form, along with their new password, to reset their password.
 * Form validation rules is managed by Formik and Yup validation schema, both client-side form handling libraries.
 *
 * @component
 * @param {Object} props The props argument.
 * @param {string} [props.userEmail=null] The user's email, if it's available.
 *
 * @returns {React.ElementType} Returns a Button that opens up a password reset modal form,
 *                              where users can input their new email and submit it.
 *
 * @example
 * // Use it inside a component JSX
 * <ChangePasswordModal userEmail="usersemail@test.com" />
 */
const ChangePasswordModal = ({ userEmail }) => {
  // State Hooks
  const [showModal, setShowModal] = useState(false); // A state to manage the visibility of the modal
  const [recoveryEmail, setRecoveryEmail] = useState(
    userEmail ? userEmail : "",
  ); // A state to manage the recovery email value
  const [isCheckingEmail, setIsCheckingEmail] = useState(false); // A state to manage the status when checking the validity of email
  const [emailExists, setEmailExists] = useState(true); // A state to manage the email existence status
  const [tokenSent, setTokenSent] = useState(false); // A state to manage the status when token has been sent
  const [showPasswords, setShowPasswords] = useState(false); // A state to manage the visibility of password
  const [isSubmitting, setIsSubmitting] = useState(false); // A state to manage the status when form is being submitted

  // Definition of icons for validation feedback
  const checkmarkIcon = (
    <i className="fa fa-check-circle" style={{ color: "green" }}></i>
  ); // Icon for successful validation
  const invalidIcon = (
    <i className="fa fa-exclamation-circle" style={{ color: "red" }}></i>
  ); // Icon for unsuccessful validation

  // Object for evaluating if email exists
  const emailExistingValidator = {
    id: "unique",
    text: "This Email address does not exist in our database.",
    validate: () => (isCheckingEmail ? true : emailExists), // Returns true if email is checking or exists
  };

  // Set of requirement rules for password
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

  // Async function to validate recovery email
  const validateRecoveryEmail = async (value) => {
    const response = await checkEmail(value);
    setIsCheckingEmail(false);
    setEmailExists(!response);
  };

  // Debounced function to validate recovery email with some delay to optimize performance
  const debouncedCheckRecoveryEmail = useCallback(
    debounce((value) => {
      if (value && value.length > 0) {
        validateRecoveryEmail(value);
      }
    }, 1500),
    [],
  );

  // UseEffect to trigger the debounced recovery email validation
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
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
        );
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

  // Function handling the form submission
  const handleSubmit = (values) => {
    // Indicates the form is being submitted
    setIsSubmitting(true);

    // Calls the resetPassword function which makes a request to the server to change the password
    resetPassword(values.token, values.newPassword).then((response) => {
      // If the request has failed, a toast message will be showed to the user
      if (response && !response.success) {
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
      } else {
        // If the request is successful, the modal will be closed and a toast message will be showed to the user
        handleClose();
        response.toast();
      }

      // Indicates that the form has finished submitting
      setIsSubmitting(false);
    });
  };

  return (
    <>
      {/* Button to trigger the modal. Text and style vary based on userEmail prop */}
      <Button
        variant={userEmail ? "primary" : "link"}
        onClick={handleShow}
        disabled
      >
        {userEmail ? "Change Password" : "Forgot your password?"}
      </Button>

      {/* Modal component for displaying the form */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change Your Password</Modal.Title>
        </Modal.Header>

        {/* Formik component for form management with validation and submission handling */}
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
            // Destructuring various helpers from Formik's render props
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body className="d-flex flex-column p-4">
                  {/* Conditional rendering based on tokenSent state */}
                  {!tokenSent ? (
                    <>
                      {/* Form group for email input */}
                      <Form.Group
                        controlId="recoveryEmail"
                        className="field-margin"
                      >
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="email"
                          // Inline event handlers for form control interactions
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
                        {/* Conditional rendering of feedback messages based on validation state */}
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

                      {/* Button to send token to user's email */}
                      <Button
                        disabled={
                          // Conditional disabling of the button
                          !emailExistingValidator.validate() || isCheckingEmail
                        }
                        onClick={fetchPasswordToken}
                      >
                        Send Token
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Form group for token input */}
                      <Form.Group
                        controlId="resetToken"
                        className="field-margin"
                      >
                        <Form.Label>Token</Form.Label>
                        <Form.Control
                          type="text"
                          name="token"
                          // Event handlers and validation feedback for token input
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

                      {/* Additional form groups for new password and password confirmation */}
                      {/* Similar structure with validation feedback */}
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
                </Modal.Body>

                {/* Modal footer with submit and close buttons, rendered only if token is sent */}
                {tokenSent && (
                  <Modal.Footer>
                    {isSubmitting ? (
                      <Button variant="primary" disabled>
                        <Spinner
                          size="sm"
                          as="span"
                          animation="border"
                          role="status"
                          aria-hidden="true"
                        />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        disabled={!isValid || !dirty}
                        onClick={handleSubmit}
                      >
                        Reset Password
                      </Button>
                    )}
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
