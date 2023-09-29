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
  const [items, setItems] = useState([
    {
      quote_item_id: "",
      product: "",
      quantity: "",
      batch: "",
      expiry: "",
      status: "OK",
    },
  ]);
  const [orderFile, setOrderFile] = useState();
  const [otherReasonDetails, setOtherReasonDetails] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
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
      console.log(relatedQuoteObj);
      setSupplier(relatedQuoteObj.supplier.name);
      setItems(() => {
        return relatedQuoteObj.items.map((item) => ({
          quote_item_id: item.id,
          quantity: item.quantity,
        }));
      });
    }
  }, [relatedQuoteObj]);

  useEffect(() => {
    const itemsValidation = allOrderItemsFilled(items);
    setIsFilled(relatedQuoteObj && arrivalDate && itemsValidation);
  }, [relatedQuoteObj, arrivalDate, items]);

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
  };
  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);

    const formData = new FormData();
    formData.append("quote", relatedQuoteObj.id);
    formData.append("arrival_date", arrivalDate);
    console.log(items);
    formData.append("items", JSON.stringify(items));
    console.log(items);
    formData.append("order_img", orderFile);
    if (otherReasonDetails.length !== 0) {
      formData.append("issue_detail", otherReasonDetails);
    }
    createOrder(token, formData).then((response) => {
      if (response && response.success) {
        onSuccessfulCreate();
        handleClose();
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
                  {relatedQuoteObj.pdf.slice(
                    relatedQuoteObj.pdf.lastIndexOf("/") + 1,
                  )}
                </span>
                <a
                  href={
                    relatedQuoteObj.pdf instanceof Blob
                      ? URL.createObjectURL(relatedQuoteObj.pdf)
                      : relatedQuoteObj.pdf
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
                {items.map((item, index) => (
                  <OrderItemComponent
                    key={`${supplier}-${index}`}
                    product={relatedQuoteObj.items[index].product}
                    onItemChange={updateItem}
                    index={index}
                    item={item}
                    onOtherReasonChange={setOtherReasonDetails}
                  />
                ))}
              </>
            ) : (
              <span>Choose a quote to view it's related products</span>
            )}
            {relatedQuoteObj && (
              <>
                <input
                  type="file"
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
