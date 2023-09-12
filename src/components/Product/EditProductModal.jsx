import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_MEASUREMENT_UNITS,
  PRODUCT_STORAGE_OPTIONS,
} from "../../config_and_helpers/config";
import { getManufacturerSelectList } from "../../clients/manufacturer_client";
import { getSupplierSelectList } from "../../clients/supplier_client";
import { getProductDetails, updateProduct } from "../../clients/product_client";

const EditProductModal = ({ product, setProduct }) => {
  const { token } = useContext(AppContext);
  const [productName, setProductName] = useState("");
  const [catalogueNumber, setCatalogueNumber] = useState("");
  const [category, setCategory] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [volume, setVolume] = useState("");
  const [storageConditions, setStorageConditions] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [productLink, setProductLink] = useState("");
  const [manufacturerList, setManufacturerList] = useState(null);
  const [manufacturer, setManufacturer] = useState("");
  const [supplierList, setSupplierList] = useState(null);
  const [supplier, setSupplier] = useState("");
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isFilled, setIsFilled] = useState(true);
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
    console.log(product);
    setProductName(product.name);
    setCatalogueNumber(product.cat_num);
    setCategory(product.category);
    setMeasurementUnit(product.unit);
    setVolume(product.volume);
    setStorageConditions(product.storage);
    setStock(product.stock);
    setPrice(product.price);
    setProductLink(product.url);
    setManufacturer(product.manufacturer.name);
    setSupplier(product.supplier.name);
    setImages(product.images);
  }, [showModal]);

  useEffect(() => {
    setIsFilled(
      productName &&
        catalogueNumber &&
        category &&
        measurementUnit &&
        volume &&
        storageConditions &&
        stock &&
        price &&
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
    stock,
    price,
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
    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map((file) => file.name).join(", ");
      setErrorMessages((prevState) => [
        ...prevState,
        `files '${invalidFileNames}' are of invalid types. Only JPEG and PNG files are allowed`,
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

  const handleClose = () => {
    setShowModal(false);
    setErrorMessages([]);
    setIsFilled(true);
  };

  const handleShow = () => setShowModal(true);

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
      formData.append("stock", stock);
      formData.append("price", price);
      formData.append("url", productLink);
      formData.append("manufacturer", manufacturer);
      formData.append("supplier", supplier);
      images.forEach((image, index) => {
        formData.append(`image${index + 1}`, image.file);
        for (var key of formData.entries()) {
          console.log(key[0] + ", " + key[1]);
        }
      });
      updateProduct(token, product.id, formData, setProduct).then(
        (response) => {
          if (response && response.success) {
            handleClose();
          } else {
            setErrorMessages((prevState) => [...prevState, response]);
          }
        },
      );
    }
  };

  if (!manufacturerList || !supplierList || !product) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Edit details
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit your personal details</Modal.Title>
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
              onChange={(e) => setStock(e.target.value)}
              value={stock}
            />
            <input
              type="number"
              placeholder="Current Price"
              id="current_price"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
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
            Save Changes
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
// EditProductModal.whyDidYouRender = true;
export default EditProductModal;
