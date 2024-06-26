import React, { useCallback, useContext, useEffect, useState } from "react";
import { Form, FormControl } from "react-bootstrap";
import { TrashFill } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import { checkSupplierSecondaryEmail } from "../../clients/supplier_client";
import debounce from "lodash/debounce";
import { AppContext } from "../../App";

/**
 * Component for managing secondary email address in a form.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {number} props.index - The index of the secondary email address.
 * @param {function} props.handleDeleteEmail - The function to handle deleting an email address.
 * @param {function} props.onEmailChange - The function to handle changing an email address.
 * @param {function} props.onSecondaryEmailValidation - The function to handle secondary email validation.
 * @param {string} props.supplierObjSecondaryEmail - The secondary email address to pre-fill the field.
 * @param {Object} props.formik - The Formik object containing the form values and methods.
 */

const SecondaryEmailComponent = ({
  index,
  handleDeleteEmail,
  onEmailChange,
  onSecondaryEmailValidation,
  supplierObjSecondaryEmail,
  formik,
}) => {
  const { token } = useContext(AppContext); // Fetching the token from the AppContext
  // State to manage the typing timeout
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [secondaryEmail, setSecondaryEmail] = useState(
    supplierObjSecondaryEmail || "",
  ); // State to manage the secondary email value
  const [
    isCheckingSupplierSecondaryEmail,
    setIsCheckingSupplierSecondaryEmail,
  ] = useState(false); // State to manage when the secondary email address is being checked
  const [isSupplierSecondaryEmailUnique, setIsSupplierSecondaryEmailUnique] =
    useState(true); // State to manage the uniqueness boolean of the secondary email

  // Function for applying a debounce effect on typing
  const handleDelayedChange = (e, value) => {
    // Clear existing timeout to reset the debounce timer
    if (typingTimeout) clearTimeout(typingTimeout);

    // Set a new timeout to delay the invocation of onEmailChange
    const newTimeout = setTimeout(() => {
      onEmailChange(e, index, value);
    }, 150);

    setTypingTimeout(newTimeout);
  };

  // Constant that updates to reflect if the secondary email address is unique or not
  const supplierSecondaryEmailUniqueValidator = {
    id: "unique",
    text: "Email address already taken.",
    validate: () =>
      isCheckingSupplierSecondaryEmail ? true : isSupplierSecondaryEmailUnique,
  };

  // The validation function that makes the request to the server and stores it's response
  const validateSupplierSecondaryEmail = useCallback(
    async (value) => {
      const response = await checkSupplierSecondaryEmail(token, value);
      setIsCheckingSupplierSecondaryEmail(false);
      setIsSupplierSecondaryEmailUnique(response);
    },
    [token],
  );

  // The validation function, applied debounce in order to only check when the user is done typing
  const debouncedCheckSupplierSecondaryEmail = useCallback(
    debounce(validateSupplierSecondaryEmail, 1500),
    [validateSupplierSecondaryEmail],
  );

  // useEffect to set the formik value to an empty string conditioned on the existence of an existing address
  useEffect(() => {
    if (!supplierObjSecondaryEmail) {
      formik.setFieldValue(`secondaryEmails[${index}]`, "");
    }
  }, [token]);

  // useEffect to call on the debounced function, if conditions are met
  useEffect(() => {
    if (secondaryEmail && secondaryEmail !== supplierObjSecondaryEmail) {
      debouncedCheckSupplierSecondaryEmail(secondaryEmail);
    } else {
      setIsCheckingSupplierSecondaryEmail(null);
      setIsCheckingSupplierSecondaryEmail(false);
    }
  }, [secondaryEmail, debouncedCheckSupplierSecondaryEmail]);

  //useEffect to call on the onSecondaryEmailValidation prop that is a setting function for a state in the parent component
  useEffect(() => {
    onSecondaryEmailValidation(isSupplierSecondaryEmailUnique);
  }, [isSupplierSecondaryEmailUnique, onSecondaryEmailValidation]);

  // if the value for the formik state was not yet set (empty string or an existing address) do not render the component
  if (formik.values?.secondaryEmails?.[index] == null) {
    return null;
  }

  // The returned JSX rendered
  return (
    // HTML Markup for secondary email form component
    <div className="mb-2 border border-secondary-subtle rounded p-3">
      <Form.Group controlId={`itemQuantity${index}`} className="field-margin">
        <Form.Label>Secondary Email {index + 1}</Form.Label>
        <FormControl
          name={`secondaryEmails[${index}]`}
          type="text"
          value={formik.values?.secondaryEmails?.[index] || ""}
          onChange={(event) => {
            // Handle change of value in the input box
            const { value } = event.target;
            setSecondaryEmail(value);
            formik.handleChange(event);
            setIsCheckingSupplierSecondaryEmail(true);
            // Call the delay handler
            handleDelayedChange(event, value);
          }}
          onBlur={formik.handleBlur}
          isValid={
            // Formik logic for determining if the input field is valid
            !formik.errors?.secondaryEmails?.[index] &&
            supplierSecondaryEmailUniqueValidator.validate() &&
            secondaryEmail &&
            !isCheckingSupplierSecondaryEmail &&
            isSupplierSecondaryEmailUnique
          }
          isInvalid={
            // Formik logic for determining if the input field is invalid
            (!!formik.errors?.secondaryEmails?.[index] &&
              secondaryEmail &&
              formik?.touched?.secondaryEmails?.[index]) ||
            (!supplierSecondaryEmailUniqueValidator.validate() &&
              secondaryEmail)
          }
        />
        {supplierSecondaryEmailUniqueValidator.validate() &&
          secondaryEmail &&
          !isCheckingSupplierSecondaryEmail && (
            <Form.Control.Feedback type="valid">
              Looks good!
            </Form.Control.Feedback>
          )}
        <Form.Control.Feedback type="invalid">
          {formik.errors?.secondaryEmails?.[index]}
          {!supplierSecondaryEmailUniqueValidator.validate() &&
            !isCheckingSupplierSecondaryEmail &&
            secondaryEmail &&
            supplierSecondaryEmailUniqueValidator.text}
        </Form.Control.Feedback>
        {isCheckingSupplierSecondaryEmail &&
          !formik.errors?.secondaryEmails?.[index] && (
            <Form.Text>Checking...</Form.Text>
          )}
      </Form.Group>
      <Button
        variant="outline-danger"
        onClick={(e) => {
          handleDeleteEmail(e, index);
        }}
      >
        <TrashFill />
      </Button>
    </div>
  );
};
export default SecondaryEmailComponent;
