import React, { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../../clients/product_client";

const DeleteButton = ({
  objectType,
  objectName,
  objectId,
  deleteFetchFunc,
}) => {
  const { token } = useContext(AppContext);
  const nav = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  function handleDelete() {
    deleteFetchFunc(token, objectId).then((response) => {
      if (response && response.success) {
        handleClose();
        nav("/inventory");
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }

  return (
    <div>
      <Button
        className="btn-outline-danger"
        variant="link"
        onClick={handleShow}
      >
        Delete
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete {objectType} {objectName}?
          </p>
          {!errorMessages && (
            <ul>
              {errorMessages.map((error, id) => (
                <li key={id} className="text-danger fw-bold">
                  {error}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={(e) => {
              handleDelete(e);
            }}
          >
            Yes, i'm certain
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Oops!
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default DeleteButton;
