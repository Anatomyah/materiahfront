import React, { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Spinner } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { showToast } from "../config_and_helpers/helpers";
import { AppContext } from "../App";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { updateProductStock } from "../clients/product_client";

const UpdateAmountModal = ({ product, onSuccessfulUpdate }) => {
  const { token } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(0);
  const [action, setAction] = useState(false);

  const handleClose = () => {
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  function handleSubmit() {
    setIsSubmitting(true);
    const adjustedAmount = action ? Math.abs(amount) : -Math.abs(amount);
    updateProductStock(token, product.productId, adjustedAmount).then(
      (response) => {
        if (response && response.success) {
          handleClose();
          onSuccessfulUpdate();
          response.toast();
        } else {
          showToast(
            "An unexpected error occurred. Please try again in a little while.",
            "error",
            "top-right",
          );
        }
        setIsSubmitting(false);
      },
    );
  }

  return (
    <div>
      <InputGroup>
        <Button
          variant="outline-success"
          onClick={() => {
            setAction(true);
            handleShow();
          }}
        >
          <AddIcon />
        </Button>
        <Form.Control
          style={{ textAlign: "center" }}
          value={amount}
          placeholder="Amount"
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          variant="outline-danger"
          onClick={() => {
            setAction(false);
            handleShow();
          }}
        >
          <RemoveIcon />
        </Button>
      </InputGroup>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {action ? `Add ${amount} to ` : `Subtract ${amount} from `}
            {product.catNum} stock?
          </p>
        </Modal.Body>
        <Modal.Footer>
          {isSubmitting ? (
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
              variant="success"
              onClick={(e) => {
                handleSubmit(e);
              }}
            >
              Confirm
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
export default UpdateAmountModal;
