import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OrderItemComponent from "./OrderItemComponent";
import { allOrderItemsFilled } from "../../config_and_helpers/helpers";
import { updateOrder } from "../../clients/order_client";

const EditOrderModal = ({ orderObj, onSuccessfulUpdate, key, resetModal }) => {
  const { token } = useContext(AppContext);
  const fileInput = useRef(null);
  const [arrivalDate, setArrivalDate] = useState(orderObj.arrival_date);
  const [items, setItems] = useState(() => {
    return orderObj.items.map((item) => ({
      quote_item: {
        id: item.quote_item.id,
        quantity: item.quote_item.quantity,
      },
      quantity: item.quantity,
      batch: item.batch,
      expiry: item.expiry,
      status: item.status,
      issue_detail: item.issue_detail,
    }));
  });
  const [orderFile, setOrderFile] = useState(orderObj.receipt_img);
  const [receivedBy, setReceivedBy] = useState(orderObj.received_by);
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    const itemsValidation = allOrderItemsFilled(items);
    setIsFilled(arrivalDate && itemsValidation);
  }, [arrivalDate, receivedBy, items]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setOrderFile(selectedFile);
    }
  };

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
    resetModal();
  };
  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);
    const finalItems = items.map((item) => ({
      quote_item_id: item.quote_item.id,
      quantity: item.quantity,
      batch: item.batch,
      expiry: item.expiry,
      status: item.status,
      issue_detail: item.issue_detail,
    }));
    console.log("final", finalItems);
    const formData = new FormData();
    formData.append("quote", orderObj.quote.id);
    formData.append("arrival_date", arrivalDate);
    formData.append("items", JSON.stringify(finalItems));
    formData.append("order_img", orderFile);
    formData.append("received_by", receivedBy);
    updateOrder(token, orderObj.id, formData, onSuccessfulUpdate).then(
      (response) => {
        if (response && response.success) {
          handleClose();
        } else {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      },
    );
  };

  if (!orderObj) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Edit Order
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            <input
              type="date"
              placeholder="Select Date"
              id="quote_date"
              onChange={(e) => setArrivalDate(e.target.value)}
              value={arrivalDate}
            />
            <h2>Supplier: {orderObj.supplier.name}</h2>
            {orderObj && (
              <>
                <span>
                  {orderObj.quote.quote_file.slice(
                    orderObj.quote.quote_file.lastIndexOf("/") + 1,
                  )}
                </span>
                <a
                  href={
                    orderObj.quote.quote_file instanceof Blob
                      ? URL.createObjectURL(orderObj.quote.quote_file)
                      : orderObj.quote.quote_file
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </a>
              </>
            )}
            {orderObj && items ? (
              <>
                {items.map((item, index) =>
                  orderObj.items[index] ? (
                    <OrderItemComponent
                      key={`${orderObj.quote.id}-${index}`}
                      product={orderObj.items[index].product}
                      onItemChange={updateItem}
                      index={index}
                      item={item}
                    />
                  ) : null,
                )}
              </>
            ) : (
              <span>Choose a quote to view it's related products</span>
            )}
            {orderObj && (
              <>
                <label htmlFor="order_file">
                  Upload Order Receipt (pdf, jpg, png, gif)):
                </label>
                <input
                  type="file"
                  id="order_file"
                  accept="application/pdf, image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  ref={fileInput}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    fileInput.current.click();
                  }}
                >
                  Upload order receipt...
                </button>
              </>
            )}
            {orderFile && (
              <>
                <span>{orderFile.name}</span>
                <a
                  href={
                    orderFile instanceof Blob
                      ? URL.createObjectURL(orderFile)
                      : orderFile
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </a>
              </>
            )}
            <input
              type="text"
              placeholder="Received by"
              id="received_by"
              onChange={(e) => setReceivedBy(e.target.value)}
              value={receivedBy}
            />
          </form>
          {errorMessages.length > 0 && (
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
            variant="primary"
            disabled={!isFilled}
            onClick={(e) => {
              handleSubmit(e);
            }}
          >
            Update Order
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default EditOrderModal;
