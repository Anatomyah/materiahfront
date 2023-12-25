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

/**
 * Represents a modal component for updating the stock amount of a product.
 *
 * This component offers a user interface for increasing or decreasing the stock level of a product.
 * It includes validation to prevent setting a negative stock level. The component can operate in two modes:
 * standalone or integrated within a larger component (like a home page), determined by the 'homeShowModal' prop.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.product - The product object containing details like current stock and product ID.
 * @param {Function} props.onSuccessfulUpdate - Callback function to execute after a successful stock update.
 * @param {boolean} [props.homeShowModal] - Flag to control the visibility of the modal in integrated mode.
 * @param {Function} [props.setHomeShowModal] - Function to set the visibility state of the modal in integrated mode.
 * @returns The UpdateAmountModal component.
 *
 * Usage:
 * ```jsx
 * <UpdateAmountModal
 *    product={productDetails}
 *    onSuccessfulUpdate={updateHandler}
 *    homeShowModal={showModalFlag}
 *    setHomeShowModal={setShowModalFlag}
 * />
 * ```
 */
const UpdateAmountModal = ({
  product,
  onSuccessfulUpdate,
  homeShowModal,
  setHomeShowModal,
}) => {
  // Context to access the application-wide token.
  const { token } = useContext(AppContext);
  // State management for various component functionalities.
  const [showModal, setShowModal] = useState(
    homeShowModal ? homeShowModal : false,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(0);
  const [productSelectList, setProductSelectList] = useState([]);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [action, setAction] = useState(false); // Action: true for adding, false for subtracting stock.
  const [negativeStockError, setNegativeStockError] = useState(false);

  // Function to fetch a list of products for the dropdown.
  const fetchProductSelectList = async () => {
    await getProductSelectList(token, setProductSelectList);
  };

  // Function to fetch details of a specific product.
  const fetchProduct = async (product) => {
    await getProductDetails(token, product.value, setFetchedProduct);
  };

  // useEffect to fetch the product select list on component mount.
  useEffect(() => {
    fetchProductSelectList();
  }, []);

  // useEffect to validate stock amount to prevent negative stock levels.
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

  // Function to close the modal.
  const handleClose = () => {
    if (setHomeShowModal) setHomeShowModal(false);
    setShowModal(false);
  };

  // Function to open the modal.
  const handleShow = () => setShowModal(true);

  // Function to handle submission of stock update.
  function handleSubmit() {
    const productIdToUse = fetchedProduct
      ? fetchedProduct?.id
      : product?.productId;
    setIsSubmitting(true);
    const adjustedAmount = action ? Math.abs(amount) : -Math.abs(amount);

    // API call to update the product stock.
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
      {/* Input group for stock adjustment outside of home modal context. */}
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

      {/* Modal for updating stock amount. */}
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
        {/* Modal footer with action buttons. */}
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
