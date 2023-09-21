import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_MEASUREMENT_UNITS,
  PRODUCT_STORAGE_OPTIONS,
} from "../../config_and_helpers/config";
import { AppContext } from "../../App";
import { createProduct } from "../../clients/product_client";
import { getManufacturerSelectList } from "../../clients/manufacturer_client";
import { getSupplierSelectList } from "../../clients/supplier_client";
import { isValidURL } from "../../config_and_helpers/helpers";

const CreateProductModal = ({ onSuccessfulCreate }) => {
  const { token } = useContext(AppContext);
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
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
    getSupplierSelectList(token, setSupplierList).then((response) => {
      if (response && !response.success) {
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
    const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    const allFiles = Array.from(event.target.files);

    const invalidFiles = allFiles.filter(
      (file) => !validImageTypes.includes(file.type),
    );
    if (invalidFiles > 0) {
      const invalidFileNames = invalidFiles.map((file) => file.name).join(", ");
      setErrorMessages((prevState) => [
        ...prevState,
        `files: ${invalidFileNames} are of invalid types. Only JPEG and PNG files are allowed`,
      ]);
    }

    const validFiles = allFiles.filter((file) =>
      validImageTypes.includes(file.type),
    );
    const newImages = validFiles.map((file) => ({
      file,
      id: `temp-${Date.now()}-${Math.random()}`,
    }));

    setImages((prevState) => [...prevState, ...newImages]);
  };

  function handleDeleteImage(imageId) {
    setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);
    const urlValidation = isValidURL(productLink);
    const priceValidation = currentPrice <= 0;
    const stockValidation = currentStock <= 0;
    const volumeValidation = volume <= 0;

    if (
      !urlValidation ||
      !priceValidation ||
      !stockValidation ||
      !volumeValidation
    ) {
      setIsFilled(false);
      setErrorMessages((prevState) => {
        const newErrorMessages = [];
        if (!urlValidation) {
          newErrorMessages.push("Invalid product link");
        }
        if (!priceValidation) {
          newErrorMessages.push(
            "Invalid price number. Must be larger than zero.",
          );
        }
        if (!stockValidation) {
          newErrorMessages.push(
            "Invalid stock number. Must be larger than zero.",
          );
        }
        if (!volumeValidation) {
          newErrorMessages.push(
            "Invalid volume number. Must be larger than zero.",
          );
        }
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
      images.forEach((image, index) => {
        formData.append(`image${index + 1}`, image.file);
      });
      createProduct(token, formData).then((response) => {
        if (response && response.success) {
          onSuccessfulCreate();
          handleClose();
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
          <Modal.Title>Create Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
            <legend>Create Product</legend>
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
            <div>
              {images.map((image) => {
                let imageUrl = image.image || URL.createObjectURL(image.file);
                return (
                  <div key={image.id}>
                    <img
                      src={imageUrl}
                      alt={`product-${catalogueNumber}-image-${image.id}`}
                      width="200"
                    />
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
              type="file"
              multiple
              id="product_images"
              onChange={handeFileChange}
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
export default CreateProductModal;