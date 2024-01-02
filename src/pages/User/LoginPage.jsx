import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../clients/user_client";
import { AppContext } from "../../App";
import AccountModal from "../../components/User/AccountModal";
import Image from "react-bootstrap/Image";
import Container from "react-bootstrap/Container";
import { Form, Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import * as formik from "formik";
import * as yup from "yup";
import "./UserPageStyle.css";
import ChangePasswordModal from "../../components/User/ChangePasswordModal";
import { largeLogo } from "../../config_and_helpers/config";

// Yup schema for the login Formik form
const schema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

/**
 * `LoginPage` is a React component that renders the login page.
 * This component captures username and password inputs, includes a "Remember Me" option, and has facilities for displaying error messages.
 * It is also able to handle form submission events, including validation checks and post-login navigation.
 *
 * Uses the following components:
 * - `AccountModal` - provides a sign up function.
 * - `ChangePasswordModal` - allows user to change their password.
 *
 * Uses the following hooks in its implementation:
 * - useState - to manage local states for login error visibility and form submission state.
 * - useNavigate - from `react-router-dom` which allows to programmatically navigate/react to changes in login state.
 * - useContext - to access the global context and to set user-related information upon successful login.
 *
 * Uses formik for form handling and yup for form validation.
 *
 * @returns A React Element displaying the Login page.
 */
const LoginPage = () => {
  // State hook for management of the login error. Initial state is set to false.
  const [loginError, setLoginError] = useState(false);

  // State hook for tracking the form submission state. Initial state is set to false.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigation hook from react-router-dom for programmatically controlling navigation.
  const nav = useNavigate();

  // useContext hooks to retrieve context methods and values from the AppContext.
  const {
    setToken, // method to set authenticated user's token
    rememberMe, // flag for remembering the user's session
    setRememberMe, // method to set the rememberMe value
    setUserDetails, // method to set the authenticated user's details
    setIsSupplier, // method to indicate whether the authenticated user is a supplier
    setNotifications, // method to control notifications
  } = useContext(AppContext);

  // Formik is used for form management and handlings.
  const { Formik } = formik;

  return (
    // Main container, the fluid prop makes it span the entire width. CSS classes are used for alignment and styling
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-content-center align-items-center background-image-login"
      style={{ minHeight: "100vh", paddingBottom: "200px" }}
    >
      {/* App Logo displayed at the top of the page */}
      <Image src={largeLogo} style={{ width: "50%" }} className="mb-5" />
      {/* Login form container, classes used for alignment and styling of form */}
      <div className="d-flex flex-column align-items-center px-5 login-box-style">
        {/* Formik component used to create the form. Form validation schema and initial values are provided */}
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={schema}
          onSubmit={(values) => {
            setIsSubmitting(true);
            login({
              credentials: values,
              setToken,
              setUserDetails,
              setIsSupplier,
              setNotifications,
              rememberMe,
            }).then((response) => {
              if (response && response.success) {
                setLoginError(false);
                nav("/");
              } else {
                setLoginError(true);
              }
              setIsSubmitting(false);
            });
          }}
        >
          {/* Form component where the form fields are outlined */}
          {({ handleSubmit, handleChange, values, errors }) => (
            <Form
              noValidate
              onSubmit={handleSubmit}
              className="d-flex flex-column align-items-center"
            >
              {/* Welcome header */}
              <h1 className="mb-3">Welcome!</h1>

              {/* Username field group */}
              <Form.Group className="mb-3" controlId="loginUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  size="lg"
                  type="text"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  isInvalid={!!errors.username}
                />
                {/* Showing validation error messages */}
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password field group */}
              <Form.Group className="mb-3" controlId="loginPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  size="lg"
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
                {/* Showing validation error messages */}
                <Form.Control.Feedback>{errors.password}</Form.Control.Feedback>
              </Form.Group>

              {/* Remember Me checkbox */}
              <Form.Group className="mb-3" controlId="formRememberMe">
                <Form.Check
                  type="checkbox"
                  label="Remember Me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              </Form.Group>

              {/* Display alert if there is a login error */}
              {loginError && (
                <div className="alert alert-danger mb-3">
                  Unable to log in with provided credentials
                </div>
              )}

              {/* Submit Button. Shows a loading spinner if the form is currently submitting */}
              {isSubmitting ? (
                <Button variant="dark" disabled>
                  <Spinner
                    size="lg"
                    as="span"
                    animation="border"
                    role="status"
                    aria-hidden="true"
                  />
                </Button>
              ) : (
                <Button variant="dark" type="submit" size="lg">
                  Login
                </Button>
              )}
            </Form>
          )}
        </Formik>

        {/* Links to the account creation and password reset modals */}
        <div className="d-flex justify-content-between align-items-end">
          <AccountModal isSignUp={true} />
          <ChangePasswordModal />
        </div>
      </div>
    </Container>
  );
};
export default LoginPage;
