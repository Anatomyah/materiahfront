import React, { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import DeleteIcon from "@mui/icons-material/Delete";
import { Spinner } from "react-bootstrap";
import { showToast } from "../../config_and_helpers/helpers";

const DeleteButton = ({
  objectType,
  objectName,
  objectId,
  deleteFetchFunc,
  onSuccessfulDelete,
}) => {
  const { token } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  function handleDelete() {
    setIsDeleting(true);
    deleteFetchFunc(token, objectId).then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulDelete();
          handleClose();
          response.toast();
          setIsDeleting(false);
        }, 2000);
      } else {
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
        );
        setIsDeleting(false);
      }
    });
  }

  return (
    <div>
      <Button variant="outline-danger" onClick={handleShow}>
        <DeleteIcon />
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete {objectType} {objectName}?
          </p>
        </Modal.Body>
        <Modal.Footer>
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
            <Button
              variant="danger"
              onClick={(e) => {
                handleDelete(e);
              }}
            >
              Yes, i'm certain
            </Button>
          )}
          <Button variant="secondary" onClick={handleClose}>
            Oops!
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default DeleteButton;
