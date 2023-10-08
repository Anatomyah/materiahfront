import React, { useContext, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "../../App";
import EditQuoteItemComponent from "./EditQuoteItemComponent";
import { allQuoteItemsFilled } from "../../config_and_helpers/helpers";
import { updateQuote } from "../../clients/quote_client";

const EditQuoteModal = ({ quoteObj, onSuccessfulUpdate, key, resetModal }) => {
  const { token } = useContext(AppContext);
  const fileInput = useRef("");
  const [quoteFile, setQuoteFile] = useState(
    quoteObj.quote_file ? quoteObj.quote_file : "",
  );
  const [items, setItems] = useState(() => {
    return quoteObj.items.map((item) => ({
      product: item.product.id,
      quantity: item.quantity,
      price: item.price || "",
    }));
  });
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    const itemsValidation = allQuoteItemsFilled(items);
    setIsFilled(itemsValidation && quoteFile);
  }, [items, quoteFile]);

  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
    resetModal();
  };

  const handleShow = () => setShowModal(true);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setQuoteFile(selectedFile);
    }
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
    formData.append("items", JSON.stringify(items));
    formData.append("quote_file", quoteFile);

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
  if (!quoteObj) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Edit Quote
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Quote {quoteObj.id} ({quoteObj.supplier.name},{" "}
            {quoteObj.request_date})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            {items && (
              <>
                {items.map((item, index) => (
                  <EditQuoteItemComponent
                    key={`${quoteObj.id}-${index}`}
                    onItemChange={updateItem}
                    index={index}
                    item={item}
                    itemTitle={{
                      name: quoteObj.items[index].product.name,
                      cat_num: quoteObj.items[index].product.cat_num,
                    }}
                    handleItemDelete={removeItem}
                    showRemoveButton={items.length === 1}
                  />
                ))}
              </>
            )}
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
              Upload quote...
            </button>
            {quoteFile && (
              <>
                <span>
                  {quoteFile.name ||
                    quoteObj.quote_file.slice(
                      quoteObj.quote_file.lastIndexOf("/") + 1,
                    )}
                </span>
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
            Update Quote
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
