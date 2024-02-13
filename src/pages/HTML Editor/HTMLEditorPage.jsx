import React, { useContext, useEffect, useState } from "react";
import HTMLEditor from "../../components/Generic/HTMLEditor";
import { largeLogo } from "../../config_and_helpers/config";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import {
  getEmailHTMLTemplate,
  updateEmailHTMLTemplate,
} from "../../clients/email_template_client";
import { AppContext } from "../../App";
import { showToast } from "../../config_and_helpers/helpers";
import { Spinner } from "react-bootstrap";

const initialHTML = `<div>Your initial HTML template here</div>`;

/**
 * Represents a page for editing HTML templates in teh react-quill editor email editor.
 *
 * @component
 */
const HtmlEditorPage = () => {
  const { token } = useContext(AppContext); // Accessing the global context
  const [isSubmitting, setIsSubmitting] = useState(false); // isSubmitting state used in the component
  const [newTemplate, setNewTemplate] = useState(initialHTML); // the HTML template management

  // Fetches the current signature template from the backend
  const fetchCurrentSignature = () => {
    getEmailHTMLTemplate(token, setNewTemplate);
  };

  // Sends the new template to the backend to update it
  const updateTemplate = () => {
    setIsSubmitting(true);
    updateEmailHTMLTemplate(token, newTemplate).then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          response.toast();
          setIsSubmitting(false);
        }, 1000);
      } else {
        // If there was an error, we halt the submission process and display a notification with the error message.
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
        setIsSubmitting(false);
      }
    });
  };

  useEffect(() => {
    fetchCurrentSignature();
  }, []);
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
          marginTop: "20px",
        }}
      >
        <Image src={largeLogo} style={{ width: "30%", marginBottom: "10px" }} />
        <h1 style={{ textAlign: "center" }}>Email Template Editor</h1>
      </div>
      <HTMLEditor
        initialTemplate={initialHTML}
        template={newTemplate}
        setTemplate={setNewTemplate}
      />

      {/* Conditionally render the submission or disabled spinner button */}
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
        <Button onClick={updateTemplate}>Submit</Button>
      )}
    </div>
  );
};
export default HtmlEditorPage;
