import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { getSupplierSelectList } from "../../clients/supplier_client";
import QuoteItemComponent from "./QuoteItemComponent";
import { getProductSelectList } from "../../clients/product_client";
const CreateQuoteModal = ({ onSuccessfulCreate }) => {
  const { token } = useContext(AppContext);
  const [supplier, setSupplier] = useState("");
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [productSelectList, setProductSelectList] = useState();
  const [date, setDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [quoteFile, setQuoteFile] = useState();
  const [items, setItems] = useState([
    { product: "", quantity: "", price: "" },
  ]);
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
      getProductSelectList(token, setProductSelectList, supplier).then(
        (response) => {
          if (response && !response.success) {
            setErrorMessages((prevState) => [...prevState, response]);
          }
        },
      );
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

  if (!supplierSelectList) {
    return "Loading...";
  }
  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Create Quote
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
            {productSelectList ? (
              <>
                {items.map((_, index) => (
                  <QuoteItemComponent
                    key={index}
                    productList={productSelectList}
                    onItemChange={updateItem}
                    index={index}
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
          {/*<Button*/}
          {/*  variant="primary"*/}
          {/*  disabled={!isFilled}*/}
          {/*  onClick={(e) => {*/}
          {/*    handleSubmit(e);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Create Manufacturer*/}
          {/*</Button>*/}
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default CreateQuoteModal;
