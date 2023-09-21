import React, { useContext, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { getSupplierSelectList } from "../../clients/supplier_client";
import QuoteItemComponent from "./QuoteItemComponent";
import { getProductSelectList } from "../../clients/product_client";
import { allItemsFilled } from "../../config_and_helpers/helpers";
import { updateQuote } from "../../clients/quote_client";

const EditQuoteModal = ({ quoteObj, onSuccessfulUpdate }) => {
  const { token } = useContext(AppContext);
  const didMountRef = useRef(false);
  const [supplier, setSupplier] = useState(quoteObj.supplier.id);
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [productSelectList, setProductSelectList] = useState();
  const [date, setDate] = useState(quoteObj.creation_date);
  const [quoteFile, setQuoteFile] = useState(quoteObj.pdf);
  const [items, setItems] = useState(() => {
    return quoteObj.items.map((item) => ({
      product: item.product.id,
      quantity: item.quantity,
      price: item.price,
    }));
  });
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    getSupplierSelectList(token, setSupplierSelectList).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, []);

  useEffect(() => {
    if (supplier) {
      getProductSelectList(
        token,
        setProductSelectList,
        quoteObj.supplier.id,
      ).then((response) => {
        if (response && !response.success) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }, [supplier]);

  useEffect(() => {
    const itemsValidation = allItemsFilled(items);
    setIsFilled(supplier && date && itemsValidation && quoteFile);
  }, [supplier, date, items, quoteFile]);

  useEffect(() => {
    if (didMountRef.current) {
      setItems([{ product: "", quantity: "", price: "" }]);
    } else {
      didMountRef.current = true;
    }
  }, [supplier]);

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setQuoteFile(selectedFile);
    }
  };

  const addItem = (e) => {
    e.preventDefault();
    setItems([...items, { product: "", quantity: "", price: "" }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);
    const formData = new FormData();
    formData.append("supplier", supplier);
    formData.append("creation_date", date);
    formData.append("items", JSON.stringify(items));
    formData.append("quote", quoteFile);

    updateQuote(token, quoteObj.id, formData, onSuccessfulUpdate).then(
      (response) => {
        if (response && response.success) {
          handleClose();
        } else {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      },
    );
  };
  if (!supplierSelectList) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Edit Quote
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            <legend>Create Product</legend>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option value="" disabled>
                --Select Supplier--
              </option>
              {supplierSelectList.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Select Date"
              id="quote_date"
              onChange={(e) => setDate(e.target.value)}
              value={date}
            />
            <input
              type="file"
              accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
            />
            <a href={quoteFile} target="_blank" rel="noopener noreferrer">
              View File
            </a>
            {productSelectList && items ? (
              <>
                {items.map((item, index) => (
                  <QuoteItemComponent
                    key={`${supplier}-${index}`}
                    productList={productSelectList}
                    onItemChange={updateItem}
                    index={index}
                    item={item}
                    itemIds={items.map((item) => item.product)}
                  />
                ))}
                <button
                  onClick={(e) => {
                    addItem(e);
                  }}
                >
                  Add Item
                </button>
              </>
            ) : (
              <span>Choose supplier to view it's related products</span>
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
            Create Quote
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default EditQuoteModal;
