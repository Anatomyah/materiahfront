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
import { updateProduct } from "../../clients/product_client";
import { isValidURL } from "../../config_and_helpers/helpers";

const EditProductModal = ({ productObj, onSuccessfulUpdate }) => {
  const { token } = useContext(AppContext);
  const [productName, setProductName] = useState(productObj.name);
  const [catalogueNumber, setCatalogueNumber] = useState(productObj.cat_num);
  const [category, setCategory] = useState(productObj.category);
  const [measurementUnit, setMeasurementUnit] = useState(productObj.unit);
  const [volume, setVolume] = useState(productObj.volume);
  const [storageConditions, setStorageConditions] = useState(
    productObj.storage,
  );
  const [stock, setStock] = useState(productObj.stock);
  const [price, setPrice] = useState(productObj.price);
  const [productLink, setProductLink] = useState(productObj.url);
  const [manufacturerList, setManufacturerList] = useState(null);
  const [manufacturer, setManufacturer] = useState(
    productObj.manufacturer.name,
  );
  const [supplierList, setSupplierList] = useState(null);
  const [supplier, setSupplier] = useState(productObj.supplier.name);
  const [images, setImages] = useState(productObj.images);
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
    setIsFilled(
      productName &&
        catalogueNumber &&
        category &&
        measurementUnit &&
        volume &&
        storageConditions &&
        (productObj.supplier_cat_item ? true : price) &&
        productLink &&
        manufacturer &&
        (productObj.supplier_cat_item ? true : supplier) &&
        images,
    );
  }, [
    productName,
    catalogueNumber,
    category,
    measurementUnit,
    volume,
    storageConditions,
    price,
    productLink,
    manufacturer,
    supplier,
    images,
  ]);

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
    setShowModal(false);
    setErrorMessages([]);
    setIsFilled(true);
  };

  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);

    const urlValidation = isValidURL(productLink);
    const priceValidation = price >= 0;
    const stockValidation = stock >= 0;
    const volumeValidation = volume >= 0;

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
      const imageIds = images
        .filter((image) => !image.file)
        .map((image) => image.id);

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
      const supplierValue = productObj.supplier_cat_item
        ? productObj.supplier.id
        : supplier;
      formData.append("supplier", supplierValue);
      formData.append("images_to_keep", imageIds);
      images.forEach((image, index) => {
        formData.append(`image${index + 1}`, image.file);
      });
      updateProduct(token, productObj.id, formData, onSuccessfulUpdate).then(
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

  if (!manufacturerList || !supplierList || !productObj) {
    return "Loading...";
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Edit details
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-control">
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
              type="text"
              placeholder="Volume"
              id="volume"
              onChange={(e) => setVolume(e.target.value)}
              value={volume}
              onKeyPress={(e) => {
                if (e.key.match(/[^0-9]/)) {
                  e.preventDefault();
                }
              }}
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
              type="text"
              placeholder="Current Stock"
              id="current_stock"
              onChange={(e) => setStock(e.target.value)}
              value={stock}
              onKeyPress={(e) => {
                if (e.key.match(/[^0-9]/)) {
                  e.preventDefault();
                }
              }}
            />
            {!productObj.supplier_cat_item && (
              <input
                type="text"
                placeholder="Current Price"
                id="current_price"
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                onKeyPress={(e) => {
                  if (e.key.match(/[^0-9]/)) {
                    e.preventDefault();
                  }
                }}
              />
            )}
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
            {!productObj.supplier_cat_item && (
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
            )}
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
                    <a
                      href={imageUrl}
                      key={image.id}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={imageUrl}
                        alt={`product-${catalogueNumber}-image-${image.id}`}
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
            <label htmlFor="product_images">
              Upload Product Images (jpg, png, gif):
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
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
