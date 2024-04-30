import React, { useState } from "react";
import { Form, FormControl } from "react-bootstrap";
import { TrashFill } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";

/**
 * Component Name: SecondaryEmailComponent
 *
 * Description: This is a React component that renders a form item to accept secondary email addresses.
 * The component allows user to input secondary email and provides an option to delete the email.
 * The component employs a debouncing function to limit the rate at which the callback function,
 * `handleDelayedChange`, is invoked as user enters input. It validates the entered email,
 * shows error feedback if the email is invalid, and becomes valid accordingly.
 *
 * Props:
 * index: The index denotes the number assigned to a secondary email
 * handleDeleteEmail: A handler function for deleting secondary email
 * onEmailChange: A handler function for updating entered secondary email
 * formik: Formik props or Formik bag for form handling (provides handleChange, handleBlur, etc.)
 *
 * Returns: A JSX element for the form item in the UI
 */

const SecondaryEmailComponent = ({
  index,
  handleDeleteEmail,
  onEmailChange,
  formik,
}) => {
  // State to manage the typing timeout
  const [typingTimeout, setTypingTimeout] = useState(null);

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

  // The returned JSX rendered
  return (
    // HTML Markup for secondary email form component
    <div className="mb-2 border border-secondary-subtle rounded p-3">
      <Form.Group controlId={`itemQuantity${index}`} className="field-margin">
        <Form.Label>Secondary Email {index + 1}</Form.Label>
        <FormControl
          name={`secondaryEmails[${index}]`}
          type="text"
          value={formik.values?.secondaryEmails[index] || ""}
          onChange={(event) => {
            // Handle change of value in the input box
            formik.handleChange(event);
            const { value } = event.target;
            // Call the delay handler
            handleDelayedChange(event, value);
          }}
          onBlur={formik.handleBlur}
          onFocus={() =>
            // Customizing Formik's setFieldTouched function
            formik.setFieldTouched(`secondaryEmails[${index}]`, true)
          }
          isValid={
            // Formik logic for determining if the input field is valid
            formik.touched.secondaryEmails[index] &&
            !formik.errors?.secondaryEmails?.[index]
          }
          isInvalid={
            // Formik logic for determining if the input field is invalid
            !!formik.errors?.secondaryEmails?.[index] &&
            formik.touched.secondaryEmails[index]
          }
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors?.secondaryEmails?.[index]}
        </Form.Control.Feedback>
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
