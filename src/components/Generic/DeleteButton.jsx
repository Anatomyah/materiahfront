import React, { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import DeleteIcon from "@mui/icons-material/Delete";
import { Spinner } from "react-bootstrap";
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
 *
 * @example
 * return (
 *   <DeleteButton
 *     objectType='post'
 *     objectName='My First Post'
 *     objectId='p1'
 *     deleteFetchFunc={deletePost}
 *     onSuccessfulDelete={removePostFromList}
 *   />
 * );
 *
 * @returns {React.Node} - The `DeleteButton` component with delete confirmation modal.
 */
const DeleteButton = ({
  objectType,
  objectName,
  objectId,
  deleteFetchFunc,
  onSuccessfulDelete,
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
        );
        setIsDeleting(false);
      }
    });
  }

  // Render the delete button along with the confirmation modal
  return (
    <div>
      {/* Delete Button*/}
      <Button variant="outline-danger" onClick={handleShow}>
        <DeleteIcon />
      </Button>

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
            {
              /* Confirmation Button */
            }(
              <Button
                variant="danger"
                onClick={(e) => {
                  handleDelete(e);
                }}
              >
                Yes, i'm certain
              </Button>,
            )
          )}
          {/* Cancel Button */}
          <Button variant="secondary" onClick={handleClose}>
            Oops!
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default DeleteButton;
