import React, { useContext, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Spinner } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { showToast } from "../../config_and_helpers/helpers";
import { AppContext } from "../../App";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  getProductDetails,
  getProductSelectList,
  updateProductStock,
} from "../../clients/product_client";
import DropdownSelect from "../Generic/DropdownSelect";

const UpdateAmountModal = ({
  product,
  onSuccessfulUpdate,
  homeShowModal,
  setHomeShowModal,
}) => {
  const { token } = useContext(AppContext);
  const [showModal, setShowModal] = useState(
    homeShowModal ? homeShowModal : false,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(0);
  const [productSelectList, setProductSelectList] = useState([]);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [action, setAction] = useState(false);
  const [negativeStockError, setNegativeStockError] = useState(false);

  const fetchProductSelectList = async () => {
    await getProductSelectList(token, setProductSelectList);
  };

  const fetchProduct = async (product) => {
    await getProductDetails(token, product.value, setFetchedProduct);
  };

  useEffect(() => {
    fetchProductSelectList();
  }, []);

  useEffect(() => {
    const relevantStock = fetchedProduct
      ? fetchedProduct?.stock
      : product?.currentStock;

    if (Number(relevantStock) - amount < 0) {
      setNegativeStockError(true);
    } else {
      setNegativeStockError(false);
    }
  }, [amount]);

  const handleClose = () => {
    if (setHomeShowModal) setHomeShowModal(false);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  function handleSubmit() {
    const productIdToUse = fetchedProduct
      ? fetchedProduct?.id
      : product?.productId;
    setIsSubmitting(true);
    const adjustedAmount = action ? Math.abs(amount) : -Math.abs(amount);

    updateProductStock(token, productIdToUse, adjustedAmount).then(
      (response) => {
        if (response && response.success) {
          handleClose();
          if (onSuccessfulUpdate) onSuccessfulUpdate();
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
      {!homeShowModal && (
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
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {homeShowModal ? (
            <DropdownSelect
              optionsList={productSelectList}
              label="Product"
              selectedValue={productSelectList.find(
                (p) => p.value === fetchedProduct?.id,
              )}
              setSelectedValue={fetchProduct}
              disabledOptions={[]}
            />
          ) : negativeStockError ? null : (
            <p>
              {action ? `Add ${amount} to ` : `Subtract ${amount} from `}
              {product?.catNum} stock?
            </p>
          )}
          {fetchedProduct && (
            <Form.Group className="mb-3 mt-3">
              <Form.Label htmlFor="amountInput">Amount</Form.Label>
              <Form.Control
                id="amountInput"
                style={{ textAlign: "center" }}
                className="w-25"
                value={amount}
                placeholder="Amount"
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>
          )}
          {negativeStockError && <h6>Product stock cannot be negative!</h6>}
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
              disabled={negativeStockError}
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
