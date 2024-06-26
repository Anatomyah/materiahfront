import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  emailRegex,
  PHONE_PREFIX_CHOICES,
} from "../../config_and_helpers/config";
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
import { Col, Form, Row, Spinner } from "react-bootstrap";
import "font-awesome/css/font-awesome.min.css";
import "./UserComponentStyle.css";
import ShowPassword from "../Generic/ShowPassword";
import debounce from "lodash/debounce";
import { showToast } from "../../config_and_helpers/helpers";
import RequiredAsteriskComponent from "../Generic/RequiredAsteriskComponent";

// Yup schema for the user Formik form
const createFormSchema = ({ isSignUp }) =>
  yup.object().shape({
    username: yup
      .string()
      .required("Username is required")
      .test("is-english", "Username must be in English", (value) => {
        return /^[a-zA-Z0-9]+$/.test(value);
      }),
    email: yup
      .string()
      .required("Email is required")
      .matches(emailRegex, "Enter a valid email"),

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

/**
 * `AccountModal` is a React component used for handling user account operations including signup and profile editing
 * It presents a form that lets users input account details such as username, email, name, phone number, and, for signup, password
 *
 * The component performs real-time validation for fields such as the username and email, ensuring their uniqueness
 * It also enforces certain standards for entry fields – e.g., the password must contain at least one uppercase letter
 *
 * @param {object} props - The properties object
 * @param {boolean} props.isSignUp - Whether this modal is being used for signup (true) or profile editing (false). Default is false
 * @returns a Bootstrap `Modal` containing a `Formik` form with fields for account details
 */
const AccountModal = ({ isSignUp = false }) => {
  // Context values from AppContext
  // token: The authentication token of the logged-in user
  // setToken: Function to set the authentication token
  // userDetails: The details of the logged-in user
  // setUserDetails: Function to set the user details
  // setNotifications: Function to handle showing notifications
  const { token, setToken, userDetails, setUserDetails, setNotifications } =
    useContext(AppContext);

  // formSchema: Validation schema for the signup form
  const formSchema = createFormSchema({ isSignUp });

  // Formik: Importing the Formik component from formik
  const { Formik } = formik;

  // nav: Navigation function from react-router
  const nav = useNavigate();

  // showModal: State for controlling the visibility of the Modal
  const [showModal, setShowModal] = useState(false);

  // isSubmitting: State to manage if form is being currently submitted
  const [isSubmitting, setIsSubmitting] = useState(false);

  // isUsernameUnique, isEmailUnique, and isPhoneUnique: States to manage the uniqueness check of username, email, and phone
  const [isUsernameUnique, setIsUsernameUnique] = useState(true);
  const [isEmailUnique, setIsEmailUnique] = useState(true);
  const [isPhoneUnique, setIsPhoneUnique] = useState(true);

  // username, emailAddress, phonePrefix, phoneSuffix: State to store the input values for the username, email, phone prefix, and phone suffix fields
  // If the modal is for signing up, these state variables start with empty strings or predefined values like "050" for phonePrefix
  // If the modal is for editing, these state variables start with corresponding user's current values
  const [username, setUsername] = useState(
    isSignUp ? "" : userDetails.username,
  );
  const [emailAddress, setEmailAddress] = useState(
    isSignUp ? "" : userDetails.email,
  );
  const [phonePrefix, setPhonePrefix] = useState(
    isSignUp ? "050" : userDetails.phone_prefix,
  );
  const [phoneSuffix, setPhoneSuffix] = useState(
    isSignUp ? "" : userDetails.phone_suffix,
  );

  // isCheckingUsername, isCheckingEmail, and isCheckingPhone: States to manage if the system is currently checking the uniqueness of username, email, and phone
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // showPasswords: State to manage the visibility of passwords in the form
  const [showPasswords, setShowPasswords] = useState(false);

  // checkmarkIcon: The icon for indicating passed validation
  const checkmarkIcon = (
    <i className="fa fa-check-circle" style={{ color: "green" }}></i>
  );

  // invalidIcon: The icon for indicating failed validation
  const invalidIcon = (
    <i className="fa fa-exclamation-circle" style={{ color: "red" }}></i>
  );

  // usernameUniqueValidator, emailUniqueValidator, and phoneUniqueValidator are objects used to check the uniqueness
  // of username, email, and phone respectively
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

  // These functions are used to validate the username, email and phone number by checking if they are already taken
  // For sign up, we just check if these values are unique.
  // For edit, we check if the new values require re-authentication.
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

  // debounce function is used to wait until the user has stopped typing for 1500ms
  // This is to prevent unnecessary requests when the user is still typing
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

  // useEffect hooks are used to trigger the checks whenever username, email or phone number is changed.
  // Different checks are made based on whether the user is signing up or editing profile.
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

  // passwordRequirements: Array of objects each containing a password requirement such as length, presence of uppercase letter, number, or special character
  // Along with a function to validate that requirement
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

  // handleClose: A function to close the modal by setting the showModal state to false
  const handleClose = () => {
    setShowModal(false);
  };

  // handleShow: A function to open the modal by setting the showModal state to true
  const handleShow = () => setShowModal(true);

  // handleSubmit: Function to be executed when the form is submitted.
  // It constructs the user data based on the form values and initiates either signup or update user profile process.
  // After the process is done, it closes the modal and
  // If it is signup, it then navigates to the home page "/".
  const handleSubmit = (values) => {
    setIsSubmitting(true);

    // Construct userData object based on provided form values
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

    // If it is a sign up operation, add password to the userData object
    if (isSignUp) {
      userData.password = values.password;
    }

    // Based on whether it is a signup or profile update operation, make the appropriate API request
    const accountPromise =
      isSignUp !== false
        ? signup(userData, setToken, setUserDetails, setNotifications) // On signup, call `signup` function
        : updateUserProfile(
            token,
            userDetails.user_id,
            userData,
            setUserDetails,
          ); // On profile update, call `updateUserProfile` function

    // Once the API request resolves,
    accountPromise.then((response) => {
      setIsSubmitting(true);
      if (response && response.success) {
        handleClose();
        // If a signup operation was completed successfully, navigate to the home page
        if (isSignUp) {
          nav("/");
        } else {
          // Otherwise, show a success toast message
          response.toast();
        }
      } else {
        // If the request isn't successful, show a generic error toast
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
      }
      // Set isSubmitting to false to indicate that the submission process is complete
      setIsSubmitting(false);
    });
  };

  return (
    <>
      {/* Button to either sign up or edit account details, depending on the isSignUp prop */}
      <Button variant={isSignUp ? "link" : "primary"} onClick={handleShow}>
        {isSignUp ? "Signup to Materiah" : "Edit Account Details"}
      </Button>

      {/* Modal for displaying the form. It shows based on the showModal state and can be closed */}
      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {isSignUp ? "Enter User Details" : "Edit Account Details"}
          </Modal.Title>
        </Modal.Header>

        {/* Formik component for form management with initial values, validation schema, and onSubmit function */}
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
              <Form onSubmit={handleSubmit}>
                <Modal.Body className="d-flex flex-column p-4">
                  {/* Form group for username with real-time validation and custom feedback messages */}
                  <Form.Group
                    controlId="signupUsername"
                    className="field-margin"
                  >
                    <Form.Label>
                      Username <RequiredAsteriskComponent />
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      // Inline event handlers for various form events
                      // Other attributes and conditional rendering...
                      value={values.username}
                      onChange={(event) => {
                        const { value } = event.target;
                        setUsername(value);
                        setIsCheckingUsername(true);
                        setFieldValue("username", value);
                      }}
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.username && !!errors.username) ||
                        (!usernameUniqueValidator.validate() &&
                          userDetails?.username)
                      }
                      isValid={
                        !errors.username &&
                        usernameUniqueValidator.validate() &&
                        username &&
                        !isCheckingUsername &&
                        isUsernameUnique
                      }
                    />
                    {usernameUniqueValidator.validate() &&
                      username &&
                      !isCheckingUsername && (
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                      )}
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                      {/* Conditional rendering of feedback messages based on validation state */}
                      {!usernameUniqueValidator.validate() &&
                        username &&
                        !isCheckingUsername &&
                        usernameUniqueValidator.text}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {isCheckingUsername
                        ? "Checking..."
                        : "150 characters or fewer. Letters, digits and @.+-_ only."}
                    </Form.Text>
                  </Form.Group>

                  {/* Rest of the form groups for email, first name, last name, and phone number follow a similar pattern */}
                  <Form.Group controlId="signupEmail" className="field-margin">
                    <Form.Label>
                      Email <RequiredAsteriskComponent />
                    </Form.Label>
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
                      onBlur={handleBlur}
                      isInvalid={
                        (touched.email && !!errors.email) ||
                        (!emailUniqueValidator.validate() && emailAddress)
                      }
                      isValid={
                        !errors.email &&
                        emailUniqueValidator.validate() &&
                        emailAddress &&
                        !isCheckingEmail &&
                        isEmailUnique
                      }
                    />
                    {emailUniqueValidator.validate() &&
                      emailAddress &&
                      !isCheckingEmail && (
                        <Form.Control.Feedback type="valid">
                          Looks good!
                        </Form.Control.Feedback>
                      )}
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                      {!errors.email &&
                        !emailUniqueValidator.validate() &&
                        !isCheckingEmail &&
                        emailAddress &&
                        emailUniqueValidator.text}
                    </Form.Control.Feedback>
                    {isCheckingEmail && !errors.email && (
                      <Form.Text>Checking...</Form.Text>
                    )}
                  </Form.Group>
                  <Form.Group
                    controlId="signupFirstName"
                    className="field-margin"
                  >
                    <Form.Label>
                      First Name <RequiredAsteriskComponent />
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isValid={!errors.firstName && values.firstName}
                      isInvalid={
                        (touched?.firstName && !values?.firstName) ||
                        (errors?.firstName &&
                          errors?.firstName !== "First name is required" &&
                          values?.firstName)
                      }
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
                    <Form.Label>
                      Last name <RequiredAsteriskComponent />
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isValid={!errors.lastName && values.lastName}
                      isInvalid={
                        (touched?.lastName && !values?.lastName) ||
                        (errors?.lastName &&
                          errors?.lastName !== "Last name is required" &&
                          values?.lastName)
                      }
                    />
                    <Form.Control.Feedback type="valid">
                      Looks good!
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Row className="field-margin">
                    <Form.Label>
                      Phone Number <RequiredAsteriskComponent />
                    </Form.Label>
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
                        onBlur={handleBlur}
                        isInvalid={
                          (touched.phoneSuffix && !!errors.phoneSuffix) ||
                          (!phoneUniqueValidator.validate() && phoneSuffix)
                        }
                        isValid={
                          !errors.phoneSuffix &&
                          phoneUniqueValidator.validate() &&
                          phoneSuffix &&
                          !isCheckingPhone &&
                          isPhoneUnique
                        }
                      />
                      {phoneUniqueValidator.validate() &&
                        phoneSuffix &&
                        !isCheckingPhone && (
                          <Form.Control.Feedback type="valid">
                            Looks good!
                          </Form.Control.Feedback>
                        )}
                      <Form.Control.Feedback type="invalid">
                        {errors.phoneSuffix}
                        {!phoneUniqueValidator.validate() &&
                          !isCheckingPhone &&
                          phoneSuffix &&
                          phoneUniqueValidator.text}
                      </Form.Control.Feedback>
                      {isCheckingPhone && <Form.Text>Checking...</Form.Text>}
                    </Form.Group>
                  </Row>
                  {/* Additional logic for password fields shown only during signup */}
                  {isSignUp && (
                    <>
                      {/* Form groups for password and password confirmation */}
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
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onFocus={() => setFieldTouched("password", true)}
                          onBlur={handleBlur}
                          isInvalid={touched.password && !!errors.password}
                          isValid={
                            touched.password &&
                            !errors.password &&
                            values.password
                          }
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
                            touched.confirmPassword &&
                            !errors.confirmPassword &&
                            values.confirmPassword &&
                            values.confirmPassword === values.password
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
                <Modal.Footer>
                  {/* Conditional rendering of submit button with a spinner to indicate submitting state */}
                  {/* The button is disabled based on various conditions like form validity and ongoing validations */}
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
                      type="submit"
                    >
                      {isSignUp ? "Signup" : "Save"}
                    </Button>
                  )}
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
