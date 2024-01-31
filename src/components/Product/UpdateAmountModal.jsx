import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Spinner } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { showToast } from "../../config_and_helpers/helpers";
import { AppContext } from "../../App";
import CheckIcon from "@mui/icons-material/Check";
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
  const [amount, setAmount] = useState("");
  const [productSelectList, setProductSelectList] = useState([]);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isInputNegative, setIsInputNegative] = useState(false);

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

    // API call to update the product stock.
    updateProductStock(token, productIdToUse, amount).then((response) => {
      if (response && response.success) {
        handleClose();
        if (onSuccessfulUpdate) onSuccessfulUpdate();
        response.toast();
      } else {
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
      }
      setIsSubmitting(false);
    });
  }

  return (
    <div>
      {/* If accessed from the Inventory Detail view, this input group for stock adjustment will appear. */}
      {!homeShowModal && (
        <InputGroup>
          <Form.Control
            style={{ textAlign: "center" }}
            value={amount}
            placeholder="Updated Amount"
            isInvalid={isInputNegative}
            onChange={(e) => {
              const inputValue = Number(e.target.value);
              // Check if the entered value is negative
              if (inputValue < 0) {
                setIsInputNegative(true);
              } else {
                setIsInputNegative(false);
              }
              setAmount(e.target.value);
            }}
          />

          {/* Button to execute the stock update. Disabled if the input is negative */}
          <Button
            disabled={isInputNegative}
            variant="outline-success"
            onClick={() => {
              handleShow();
            }}
            className="rounded-edge-button-right"
          >
            <CheckIcon />
          </Button>

          {/* Negative feedback if the number entered is negative */}
          <Form.Control.Feedback type="invalid">
            Number cannot be negative!
          </Form.Control.Feedback>
        </InputGroup>
      )}

      {/* Modal for updating stock amount. */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* If accessed viww the Inventory Detail view, a confirmation message will appear. */}
          {!homeShowModal && (
            <h4>
              Update {product.catNum}'s stock from {product.currentStock} to{" "}
              {amount}?
            </h4>
          )}

          {/* If accessed via the home page's quick actions, a dropdown menu of the lab's products will appear. */}
          <div className="d-flex flex-column align-items-center text-center">
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
            ) : null}

            {/* Once the product is chosen, the input field to enter the updates stock and confirmation button will appear */}
            {fetchedProduct && (
              <>
                <div className="d-flex flex-row align-items-center mt-3">
                  <h6 className="mt-1">Current stock:</h6>
                  <p className="ms-2 mb-1">{fetchedProduct.stock}</p>
                </div>
                <Form.Group className="d-flex flex-column justify-content-center mt-3 mb-2">
                  <Form.Label>Updated Amount</Form.Label>
                  <Form.Control
                    id="amountInput"
                    style={{ textAlign: "center" }}
                    className="w-50 mx-auto"
                    value={amount}
                    placeholder="Updated Amount"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Form.Group>
              </>
            )}
          </div>
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
