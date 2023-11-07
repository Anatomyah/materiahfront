import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OrderItemComponent from "./OrderItemComponent";
import { allOrderItemsFilled } from "../../config_and_helpers/helpers";
import {
  finalizeOrderImageUploadStatus,
  updateOrder,
} from "../../clients/order_client";
import { uploadImagesToS3 } from "../../clients/product_client";

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
  const [images, setImages] = useState(orderObj.images);
  const [receivedBy, setReceivedBy] = useState(orderObj.received_by);
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    const itemsValidation = allOrderItemsFilled(items);
    setIsFilled(arrivalDate && itemsValidation && images);
  }, [arrivalDate, receivedBy, items, images]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  useEffect(() => {
    console.log(images);
  }, [images]);

  const handeFileChange = (event) => {
    const allFiles = Array.from(event.target.files);

    const newImages = allFiles.map((file) => ({
      file,
      id: `temp-${Date.now()}-${Math.random()}`,
    }));

    setImages((prevState) => [...prevState, ...newImages]);
  };

  function handleDeleteImage(imageId) {
    setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
  }

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

    const imagesToDelete = orderObj.images
      .filter((obj1) => !images.some((obj2) => obj1.id === obj2.id))
      .map((obj) => obj.id);

    const newImages = images.filter((image) => image.file);

    const formData = new FormData();
    formData.append("quote", orderObj.quote.id);
    formData.append("arrival_date", arrivalDate);
    formData.append("items", JSON.stringify(finalItems));
    formData.append("received_by", receivedBy);

    if (imagesToDelete) {
      formData.append("images_to_delete", imagesToDelete);
    }

    if (newImages.length) {
      const imageInfo = newImages.map((image) => ({
        id: image.id,
        type: image.file.type,
      }));
      formData.append("images", JSON.stringify(imageInfo));
    }

    updateOrder(token, orderObj.id, formData, onSuccessfulUpdate).then(
      (response) => {
        if (response && response.success) {
          if (response.success && response.preSignedUrls) {
            uploadImagesToS3(response.preSignedUrls, newImages).then(
              (response) => {
                if (response && response.uploadStatuses) {
                  finalizeOrderImageUploadStatus(
                    token,
                    response.uploadStatuses,
                  ).then((response) => {
                    if (response && !response.success) {
                      setErrorMessages((prevState) => [...prevState, response]);
                    }
                  });
                } else {
                  setErrorMessages((prevState) => [...prevState, response]);
                }
              },
            );
          }
          setTimeout(() => {
            onSuccessfulUpdate();
          }, 1000);
          handleClose();
          resetModal();
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
                  {orderObj.quote.quote_url.slice(
                    orderObj.quote.quote_url.lastIndexOf("/") + 1,
                  )}
                </span>
                <a
                  href={
                    orderObj.quote.quote_url instanceof Blob
                      ? URL.createObjectURL(orderObj.quote.quote_url)
                      : orderObj.quote.quote_url
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
                  onChange={handeFileChange}
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
            <div>
              {images.map((image) => {
                let imageUrl =
                  image.image_url || URL.createObjectURL(image.file);
                return (
                  <div key={image.id}>
                    <a
                      href={imageUrl}
                      key={image.id}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={imageUrl}
                        alt={`order-${orderObj.id}-image-${image.id}`}
                        width="200"
                      />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
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
