import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import {
  getOpenQuotesSelectList,
  getQuoteDetails,
} from "../../clients/quote_client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OrderItemComponent from "./OrderItemComponent";
import { allOrderItemsFilled } from "../../config_and_helpers/helpers";
import { createOrder } from "../../clients/order_client";

const CreateOrderModal = ({ onSuccessfulCreate }) => {
  const { token } = useContext(AppContext);
  const fileInput = useRef(null);
  const [relatedQuoteObj, setRelatedQuoteObj] = useState();
  const [supplier, setSupplier] = useState("");
  const [openQuotesSelectList, setOpenQuotesSelectList] = useState([]);
  const [selectedQuoteOption, setSelectedQuoteOption] = useState("");
  const [arrivalDate, setArrivalDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [items, setItems] = useState([]);
  const [images, setImages] = useState([]);
  const [receivedBy, setReceivedBy] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    console.log(relatedQuoteObj);
  }, [relatedQuoteObj]);

  const fetchQuote = (quoteId) => {
    getQuoteDetails(token, quoteId, setRelatedQuoteObj).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  useEffect(() => {
    getOpenQuotesSelectList(token, setOpenQuotesSelectList).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, []);

  useEffect(() => {
    if (relatedQuoteObj) {
      setSupplier(relatedQuoteObj.supplier.name);
      setItems(() => {
        return relatedQuoteObj.items.map((item) => ({
          quote_item_id: item.id,
          cat_num: item.product.cat_num,
          quantity: item.quantity,
          status: "OK",
        }));
      });
    }
  }, [relatedQuoteObj]);

  useEffect(() => {
    console.log(items);
  }, [items]);

  useEffect(() => {
    const itemsValidation = allOrderItemsFilled(items);
    setIsFilled(
      relatedQuoteObj && arrivalDate && receivedBy && itemsValidation && images,
    );
  }, [relatedQuoteObj, arrivalDate, receivedBy, items, images]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleFileChange = (event) => {
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
  };

  const resetModal = () => {
    setRelatedQuoteObj(null);
    setSupplier("");
    setOpenQuotesSelectList([]);
    setSelectedQuoteOption("");
    setArrivalDate(new Date().toISOString().split("T")[0]);
    setItems([]);
    setImages([]);
    setReceivedBy("");
  };

  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);

    const formData = new FormData();
    formData.append("quote", relatedQuoteObj.id);
    formData.append("arrival_date", arrivalDate);
    formData.append("items", JSON.stringify(items));
    formData.append("received_by", receivedBy);
    images.forEach((image, index) => {
      formData.append(`image${index + 1}`, image.file);
    });
    createOrder(token, formData).then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          onSuccessfulCreate();
        }, 1000);
        handleClose();
        resetModal();
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  if (!openQuotesSelectList) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Create Order
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            <select
              value={selectedQuoteOption}
              onChange={(e) => {
                setSelectedQuoteOption(e.target.value);
                fetchQuote(e.target.value);
              }}
            >
              <option value="" disabled>
                --Select Quote--
              </option>
              {openQuotesSelectList.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Select Date"
              id="quote_date"
              onChange={(e) => setArrivalDate(e.target.value)}
              value={arrivalDate}
            />
            <h2>Supplier: {supplier}</h2>
            {relatedQuoteObj && (
              <>
                <span>
                  {relatedQuoteObj.quote_file.slice(
                    relatedQuoteObj.quote_file.lastIndexOf("/") + 1,
                  )}
                </span>
                <a
                  href={
                    relatedQuoteObj.quote_file instanceof Blob
                      ? URL.createObjectURL(relatedQuoteObj.quote_file)
                      : relatedQuoteObj.quote_file
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </a>
              </>
            )}
            {relatedQuoteObj && items ? (
              <>
                {items.map((item, index) =>
                  relatedQuoteObj.items[index] ? (
                    <OrderItemComponent
                      key={`${relatedQuoteObj.id}-${index}`}
                      product={relatedQuoteObj.items[index].product}
                      onItemChange={updateItem}
                      index={index}
                      item={item}
                      quoteItem={relatedQuoteObj.items[index]}
                    />
                  ) : null,
                )}
              </>
            ) : (
              <span>Choose a quote to view it's related products</span>
            )}
            {relatedQuoteObj && (
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
            <div>
              {images.map((image) => {
                let imageUrl = image.image || URL.createObjectURL(image.file);
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
                        alt={`order-quote-${relatedQuoteObj.id}-image-${image.id}`}
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
            <button onClick={resetModal}>Reset form</button>
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
            Create Order
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default CreateOrderModal;
