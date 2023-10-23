import React, { useContext, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import { getSupplierSelectList } from "../../clients/supplier_client";
import { getProductSelectList } from "../../clients/product_client";
import { allQuoteItemsFilled } from "../../config_and_helpers/helpers";
import { createQuoteManually } from "../../clients/quote_client";
import CreateQuoteItemComponent from "./CreateQuoteItemComponent";

const CreateQuoteModal = ({ onSuccessfulCreate }) => {
  const { token } = useContext(AppContext);
  const fileInput = useRef("");
  const [supplier, setSupplier] = useState("");
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [productSelectList, setProductSelectList] = useState([]);
  const [quoteFile, setQuoteFile] = useState("");
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

  useEffect(() => {
    const itemsValidation = allQuoteItemsFilled(items);
    setIsFilled(supplier && itemsValidation && quoteFile);
  }, [supplier, items, quoteFile]);

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
  };

  const resetModal = () => {
    setSupplier("");
    setSupplierSelectList([]);
    setProductSelectList([]);
    setQuoteFile("");
    setItems([{ product: "", quantity: "", price: "" }]);
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

  const removeItem = (e, index) => {
    e.preventDefault();
    if (items.length === 1) {
      return;
    }
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);

    const formData = new FormData();
    formData.append("supplier", supplier);
    formData.append("items", JSON.stringify(items));
    formData.append("quote_file", quoteFile);

    createQuoteManually(token, formData).then((response) => {
      if (response && response.success) {
        onSuccessfulCreate();
        handleClose();
        resetModal();
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
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
          <Modal.Title>Create Quote</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
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
            <label htmlFor="quote_file">Upload Quote File (pdf, docx):</label>
            <input
              type="file"
              id="quote_file"
              accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
              Upload quote
            </button>
            {quoteFile && (
              <>
                <span>{quoteFile.name}</span>
                <a
                  href={
                    quoteFile instanceof Blob
                      ? URL.createObjectURL(quoteFile)
                      : quoteFile
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </a>
              </>
            )}
            {productSelectList ? (
              <>
                {items.map((_, index) => (
                  <CreateQuoteItemComponent
                    key={`${supplier}-${index}`}
                    productList={productSelectList}
                    onItemChange={updateItem}
                    index={index}
                    itemIds={items.map((item) => item.product)}
                    handleItemDelete={removeItem}
                    showRemoveButton={items.length === 1}
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
              <span>Choose a supplier to view it's related products</span>
            )}
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
export default CreateQuoteModal;
