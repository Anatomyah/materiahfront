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

const schema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

const LoginPage = () => {
  const [loginError, setLoginError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useNavigate();
  const {
    setToken,
    rememberMe,
    setRememberMe,
    setUserDetails,
    setIsSupplier,
    setNotifications,
  } = useContext(AppContext);
  const { Formik } = formik;

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-content-center align-items-center background-image-login"
      style={{ minHeight: "100vh", paddingBottom: "200px" }}
    >
      <Image src={largeLogo} style={{ width: "50%" }} className="mb-5" />
      <div className="d-flex flex-column align-items-center px-5 login-box-style">
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
              setIsSubmitting(true);
            });
          }}
        >
          {({ handleSubmit, handleChange, values, errors }) => (
            <Form
              noValidate
              onSubmit={handleSubmit}
              className="d-flex flex-column align-items-center"
            >
              <h1 className="mb-3">Welcome!</h1>

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
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>

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
                <Form.Control.Feedback>{errors.password}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formRememberMe">
                <Form.Check
                  type="checkbox"
                  label="Remember Me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              </Form.Group>

              {loginError && (
                <div className="alert alert-danger mb-3">
                  Unable to log in with provided credentials
                </div>
              )}

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
        <div className="d-flex justify-content-between align-items-end">
          <AccountModal isSignUp={true} />
          <ChangePasswordModal />
        </div>
      </div>
    </Container>
  );
};
export default LoginPage;
