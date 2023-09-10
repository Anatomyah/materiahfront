import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_MEASUREMENT_UNITS,
  PRODUCT_STORAGE_OPTIONS,
} from "../config_and_helpers/config";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../clients/product_client";
import { getManufacturerSelectList } from "../clients/manufacturer_client";
import { getSupplierSelectList } from "../clients/supplier_client";

const AddProductModal = () => {
  const { token } = useContext(AppContext);
  const nav = useNavigate();
  const [productName, setProductName] = useState("");
  const [catalogueNumber, setCatalogueNumber] = useState("");
  const [category, setCategory] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [volume, setVolume] = useState("");
  const [storageConditions, setStorageConditions] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [productLink, setProductLink] = useState("");
  const [manufacturerList, setManufacturerList] = useState(null);
  const [manufacturer, setManufacturer] = useState("");
  const [supplierList, setSupplierList] = useState(null);
  const [supplier, setSupplier] = useState("");
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    getManufacturerSelectList(token, setManufacturerList).then((response) => {
      if (!response) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
    getSupplierSelectList(token, setSupplierList).then((response) => {
      if (!response) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, []);

  useEffect(() => {
    setIsFilled(
      productName &&
        catalogueNumber &&
        category &&
        measurementUnit &&
        volume &&
        storageConditions &&
        currentStock &&
        currentPrice &&
        productLink &&
        manufacturer &&
        supplier &&
        images,
    );
  }, [
    productName,
    catalogueNumber,
    category,
    measurementUnit,
    volume,
    storageConditions,
    currentStock,
    currentPrice,
    productLink,
    manufacturer,
    supplier,
    images,
  ]);

  const handeFileChange = (event) => {
    const images = Array.from(event.target.files);
    setImages(images);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);

    if (!isFilled) {
      setIsFilled(false);
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        return [...prevState, ...newErrorMessages];
      });
    } else {
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("cat_num", catalogueNumber);
      formData.append("category", category);
      formData.append("unit", measurementUnit);
      formData.append("volume", volume);
      formData.append("storage", storageConditions);
      formData.append("stock", currentStock);
      formData.append("price", currentPrice);
      formData.append("url", productLink);
      formData.append("manufacturer", manufacturer);
      formData.append("supplier", supplier);
      images.forEach((file, index) => {
        console.log(images);
        formData.append(`file${index + 1}`, file);
        console.log(formData);
      });
      createProduct(token, formData).then((response) => {
        if (!response) {
        } else {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  };
  const handleClose = () => {
    setErrorMessages([]);
    setIsFilled(null);
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  if (!manufacturerList || !supplierList) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Add Product
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit your personal details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            className="form-control"
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            <legend>Signup</legend>
            <input
              type="text"
              placeholder="Product Name"
              id="product_name"
              onChange={(e) => setProductName(e.target.value)}
              value={productName}
            />
            <input
              type="text"
              placeholder="Catalogue Number"
              id="catalogue_number"
              onChange={(e) => setCatalogueNumber(e.target.value)}
              value={catalogueNumber}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                --Select Product Category--
              </option>
              {PRODUCT_CATEGORIES.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <select
              value={measurementUnit}
              onChange={(e) => setMeasurementUnit(e.target.value)}
            >
              <option value="" disabled>
                --Select Measurement Unit--
              </option>
              {PRODUCT_MEASUREMENT_UNITS.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Volume"
              id="volume"
              onChange={(e) => setVolume(e.target.value)}
              value={volume}
            />
            <select
              value={storageConditions}
              onChange={(e) => setStorageConditions(e.target.value)}
            >
              <option value="" disabled>
                --Select Storage Condition--
              </option>
              {PRODUCT_STORAGE_OPTIONS.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Current Stock"
              id="current_stock"
              onChange={(e) => setCurrentStock(e.target.value)}
              value={currentStock}
            />
            <input
              type="number"
              placeholder="Current Price"
              id="current_price"
              onChange={(e) => setCurrentPrice(e.target.value)}
              value={currentPrice}
            />
            <select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            >
              <option value="" disabled>
                --Select Manufacturer--
              </option>
              {manufacturerList.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option value="" disabled>
                --Select Supplier--
              </option>
              {supplierList.map((choice, index) => (
                <option key={index} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <input
              type="url"
              placeholder="Product Link"
              id="product_link"
              onChange={(e) => setProductLink(e.target.value)}
              value={productLink}
            />
            <input
              type="file"
              multiple
              id="product_images"
              onChange={handeFileChange}
            />
            {!errorMessages && (
              <ul>
                {errorMessages.map((error, id) => (
                  <li key={id} className="text-danger fw-bold">
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            disabled={!isFilled}
            onClick={(e) => {
              handleSubmit(e);
            }}
          >
            Add Product
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default AddProductModal;
