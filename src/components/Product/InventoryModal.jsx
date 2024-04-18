import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Col } from "react-bootstrap";
import { Link } from "react-bootstrap-icons";
import CarouselComponent from "../Generic/CarouselComponent";
import ProductModal from "./ProductModal";
import DeleteButton from "../Generic/DeleteButton";
import { deleteProduct } from "../../clients/product_client";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import ManufacturerDetailModal from "../Manufacturer/ManufacturerDetailModal";
import UpdateAmountModal from "./UpdateAmountModal";
import Table from "react-bootstrap/Table";
import StockItemComponent from "./StockItemComponent";
import "./ProductComponentStyle.css";

// plusIcon: The icon for adding a stock item
const plusIcon = (
  <i className="fa fa-solid fa-plus" style={{ color: "green" }}></i>
);

/**
 * Represents an inventory modal component for displaying and managing product details.
 *
 * This component shows detailed information about a product and it's related stock items, provides options
 * to edit, update stock amounts, or delete the product. It uses a modal layout to
 * display the product details and includes embedded components like `UpdateAmountModal`,
 * `ProductModal`, `SupplierDetailModal`, and `ManufacturerDetailModal` for specific functionalities.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.product - The product object containing detailed information.
 * @param {Function} props.handleEdit - Callback function to handle the edit operation on the product.
 * @param {Function} props.updateProducts - Callback function to update the products list post deletion.
 * @returns The InventoryModal component.
 *
 * Usage:
 * ```jsx
 * <InventoryModal
 *    product={productDetails}
 *    handleEdit={editHandler}
 *    updateProducts={productsUpdateHandler}
 * />
 * ```
 */
const InventoryModal = ({ product, handleEdit, updateProducts }) => {
  // State for controlling the visibility of the modal.
  const [show, setShow] = useState(false);
  // State for managing the product items in stock
  const [items, setItems] = useState(product ? product.items : []);
  // State for managing the showing of a new empty item table row
  const [addNewItem, setAddNewItem] = useState(false);

  // Function to close the modal.
  const handleClose = () => setShow(false);
  // Function to show the modal.
  const handleShow = () => setShow(true);

  // Function to show a new stock item row in the Stock items table.
  const addStockItem = () => {
    setAddNewItem(!addNewItem);
  };

  // Function to update the stock items array
  const updateStockItems = (itemObj, deleteItem) => {
    // if the 'addNewItem' state is true, this is a creation of a new product, thus returning 'addNewItem' to false
    if (addNewItem) addStockItem();
    // if the deleteItem param was passed, remove it from the items array via filtering
    if (deleteItem) {
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemObj.id),
      );
      // else, update the items array when the passed in itemObj
    } else {
      setItems((prevItems) => [...prevItems, itemObj]);
    }
  };

  return (
    <>
      {/* Button to open the modal, displaying the product's name. */}
      <Button variant="link" onClick={handleShow}>
        {product.name}
      </Button>

      {/* The Modal component that appears upon clicking the button. */}
      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby="product-modal"
        fullscreen={true}
      >
        {/* Modal header with the product name as the title. */}
        <Modal.Header closeButton>
          <Modal.Title>{product.name}</Modal.Title>
        </Modal.Header>

        {/* Modal body containing product details. */}
        <Modal.Body>
          <Container>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Catalogue Number: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.cat_num}</p>
              </Col>
            </Row>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Stock: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.stock}</p>
              </Col>
              <Col md={4}>
                <UpdateAmountModal
                  product={{
                    catNum: product.cat_num,
                    productId: product.id,
                    currentStock: product.stock,
                  }}
                  onSuccessfulUpdate={handleEdit}
                />
              </Col>
            </Row>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Category: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.category}</p>
              </Col>
            </Row>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Supplier: </p>
              </Col>
              <Col>
                <SupplierDetailModal supplierId={product.supplier} />
              </Col>
            </Row>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Manufacturer: </p>
              </Col>
              <Col>
                {product?.manufacturer && (
                  <ManufacturerDetailModal
                    manufacturerId={product.manufacturer}
                  />
                )}
              </Col>
            </Row>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Unit: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.unit}</p>
              </Col>
            </Row>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Unit Quantity: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.unit_quantity}</p>
              </Col>
            </Row>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Storage: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.storage}</p>
              </Col>
            </Row>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Location: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.location}</p>
              </Col>
            </Row>
            <Row md={3}>
              <Col className="mt-1">
                <p className="fs-6 fw-bold">Website Profile: </p>
              </Col>
              <Col>
                <a href={product.url} target="_blank" rel="noopener noreferrer">
                  <Link size={"2.2rem"} />
                </a>
              </Col>
            </Row>

            {/* Bootstrap Carousel component to display product images */}
            <hr />
            <CarouselComponent images={product.images} />
            <hr />

            {/* Bootstrap Table component to display the related items to the product currently in stock */}
            <Row>
              <Col className="text-start">
                <p className="fs-6 fw-bold">Items in Stock:</p>
              </Col>
            </Row>

            {/* Render a table to display the stock items related to the product */}
            <Table striped bordered hover>
              <thead>
                <tr className="text-center">
                  <th>#</th>
                  <th>ID</th>
                  <th>Order</th>
                  <th>Received</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>In Use?</th>
                  <th>Opened On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Render a new table row when the plus button at the bottom of the table is clicked */}
                {addNewItem && (
                  <StockItemComponent
                    productId={product.id}
                    onSuccessfulSubmit={updateStockItems}
                    showAddNewItem={addStockItem}
                  />
                )}

                {/* Render a mapping function mapping over the items related to the product */}
                {items.map((item, index) => (
                  <StockItemComponent
                    key={index}
                    itemObj={item}
                    index={index}
                    editItem={true}
                    onSuccessfulSubmit={updateStockItems}
                  />
                ))}

                {/* If there are no items in the items array or if not in the process of adding a new item, render this row */}
                {items.length === 0 && !addNewItem ? (
                  <tr className="text-center align-middle">
                    <td colSpan="9">No items related to this product</td>
                  </tr>
                ) : null}

                {/* Render the plus button to add a new item row */}
                <tr className="text-center align-middle">
                  <td colSpan="9">
                    <Button variant="outline-light" onClick={addStockItem}>
                      {plusIcon}
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Container>
        </Modal.Body>
        {/* Modal footer with action buttons. */}
        <Modal.Footer className="d-flex flex-row justify-content-between">
          <div className="d-flex flex-row">
            <div className="me-2">
              <ProductModal
                productObj={product}
                onSuccessfulSubmit={handleEdit}
              />
            </div>
            <DeleteButton
              objectType="product"
              objectName={product.name}
              objectId={product.id}
              deleteFetchFunc={deleteProduct}
              onSuccessfulDelete={updateProducts}
            />
          </div>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default InventoryModal;
