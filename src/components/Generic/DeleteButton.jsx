import React, { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import DeleteIcon from "@mui/icons-material/Delete";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { showToast } from "../../config_and_helpers/helpers";

/**
 * The `DeleteButton` component is a reusable dialogue confirmation button.
 *
 * This component is an encapsulated Bootstrap Button which, when clicked, opens a Bootstrap Modal asking for confirmation of a delete action.
 * It takes as props an objectType (to display in the delete confirmation), objectName (to display in the delete confirmation), an objectId(to delete),
 * a deleteFetchFunc (the function for deletion), and an onSuccessfulDelete callback for updates after successfully deleting an item.
 *
 * @component
 *
 * @prop {string} objectType - Type of object to delete.
 * @prop {string} objectName - Name of object to delete.
 * @prop {string} objectId - Id of the object to delete.
 * @prop {Function} deleteFetchFunc - Function that handles the deletion. This function should return a promise.
 * @prop {Function} onSuccessfulDelete - Callback that is called after a successful deletion to update the UI accordingly.
 * @prop {Function} disableDelete - A boolean prop to enable the disabling of the delete button when relevant
 *
 * @example
 * return (
 *   <DeleteButton
 *     objectType='post'
 *     objectName='My First Post'
 *     objectId='p1'
 *     deleteFetchFunc={deletePost}
 *     onSuccessfulDelete={removePostFromList}
 *     disableDelete={true}
 *   />
 * );
 *
 */
const DeleteButton = ({
  objectType,
  objectName,
  objectId,
  deleteFetchFunc,
  onSuccessfulDelete,
  disableDelete,
}) => {
  // Access token from the app-wide context
  const { token } = useContext(AppContext);
  // React hooks for controlling the display of the modal and delete operation state
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to close the confirmation modal
  const handleClose = () => {
    setShowModal(false);
  };

  const renderButton = () => {
    // Tooltip rendering function
    const renderTooltip = (props) => (
      <Tooltip id={`tooltip-delete-${objectId}`} {...props}>
        Cannot delete: Quote linked to an order.
      </Tooltip>
    );

    if (disableDelete) {
      return (
        <OverlayTrigger
          overlay={renderTooltip}
          placement="top"
          delay={{ show: 50, hide: 400 }}
        >
          {/* Wrapping disabled button in a span */}
          <span className="d-inline-block">
            {/* Button is displayed but disabled to communicate that the button's action is unavailable */}
            <Button
              variant="outline-danger"
              disabled
              // 'pointerEvents: "none"' ensures that it doesn't capture any events like clicking or hovering.
              style={{ pointerEvents: "none" }}
            >
              {/* DeleteIcon represents the trash bin or delete icon */}
              <DeleteIcon />
            </Button>
          </span>
        </OverlayTrigger>
      );
    } else {
      return (
        // If the 'disableDelete' variable is false,
        // return an active button that triggers the handleShow function on click.
        <Button variant="outline-danger" onClick={handleShow}>
          <DeleteIcon />
        </Button>
      );
    }
  };

  // Function to show the confirmation modal
  const handleShow = () => setShowModal(true);

  // Function to handle delete action
  function handleDelete() {
    setIsDeleting(true);
    // Call the delete fetch function and handle the promise it returns
    deleteFetchFunc(token, objectId).then((response) => {
      // If the delete operation was successful
      if (response && response.success) {
        // Delay the UI update operations to create smoother UX
        setTimeout(() => {
          // Call the successful delete callback
          onSuccessfulDelete();
          // Close the confirmation modal
          handleClose();
          // Display toast notification
          response.toast();
          // Set isDeleting to false to indicate delete operation has finished
          setIsDeleting(false);
        }, 2000);
      } else {
        // If there was any error during deletion operation, display error toast
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
        setIsDeleting(false);
      }
    });
  }

  // Render the delete button along with the confirmation modal
  return (
    <div>
      {/* Render button with or without overlay based on disableDelete */}
      {renderButton()}

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          {/* Modal Title */}
          <Modal.Title>Delete confirmation</Modal.Title>
        </Modal.Header>
        {/* Modal Body */}
        <Modal.Body>
          <p>
            Are you sure you want to delete {objectType} {objectName}?
          </p>
        </Modal.Body>
        {/* Modal Footer */}
        <Modal.Footer>
          {/* Display a Spinner in the button till the delete request is being processed */}
          {isDeleting ? (
            <Button variant="danger" disabled>
              <Spinner
                size="sm"
                as="span"
                animation="border"
                role="status"
                aria-hidden="true"
              />
            </Button>
          ) : (
            // Confirmation button
            <>
              <Button
                variant="danger"
                onClick={(e) => {
                  handleDelete(e);
                }}
              >
                Yes, i'm certain
              </Button>
              {/* Cancel button */}
              <Button variant="secondary" onClick={handleClose}>
                Oops!
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default DeleteButton;
