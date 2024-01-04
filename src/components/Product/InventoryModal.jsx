import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Col } from "react-bootstrap";
import LinkIcon from "@mui/icons-material/Link";
import SaveIcon from "@mui/icons-material/Save";
import CarouselComponent from "../Generic/CarouselComponent";
import ProductModal from "./ProductModal";
import DeleteButton from "../Generic/DeleteButton";
import { deleteProduct } from "../../clients/product_client";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import ManufacturerDetailModal from "../Manufacturer/ManufacturerDetailModal";
import UpdateAmountModal from "./UpdateAmountModal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";

/**
 * Represents an inventory modal component for displaying and managing product details.
 *
 * This component shows detailed information about a product and provides options
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
  const [items, setItems] = useState(
    product
      ? () => {
          return product.items.map((item) => ({
            batch: item.batch,
            expiry: item.expiry,
            inUse: item.in_use,
          }));
        }
      : [],
  );
  const [addNewItem, setAddNewItem] = useState(false);
  const [newItem, setNewItem] = useState({
    batch: "",
    expiry: "",
    inUse: false,
  });

  // Function to close the modal.
  const handleClose = () => setShow(false);
  // Function to show the modal.
  const handleShow = () => setShow(true);

  // Function to update the newItem object with the inputs from the new stock item line in the table
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Function to show a new stock item row in the Stock items table.
  const addStockItem = () => {
    setAddNewItem(!addNewItem);
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
        size="lg"
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
                <SupplierDetailModal supplierId={product.supplier.id} />
              </Col>
            </Row>
            <Row md={3}>
              <Col>
                <p className="fs-6 fw-bold">Manufacturer: </p>
              </Col>
              <Col>
                <ManufacturerDetailModal
                  manufacturerId={product.manufacturer.id}
                />
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
              <Col className="mt-1">
                <p className="fs-6 fw-bold">Website Profile: </p>
              </Col>
              <Col>
                <a href={product.url}>
                  <LinkIcon sx={{ fontSize: "36px", alignSelf: "middle" }} />
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
              <Col className="text-end">
                <Button
                  className="field-margin"
                  variant="outline-success"
                  onClick={addStockItem}
                >
                  Add Item
                </Button>
              </Col>
            </Row>
            <Table striped bordered hover>
              <thead>
                <tr className="text-center">
                  <th>#</th>
                  <th>Order</th>
                  <th>Received At</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>In Use?</th>
                </tr>
              </thead>
              <tbody>
                {addNewItem && (
                  <tr className="text-center align-middle">
                    <td></td>
                    {/* Empty cell for the index */}
                    <td>N/A</td>
                    <td>N/A</td>
                    <td>
                      <Form.Control
                        type="text"
                        name="batch"
                        value={newItem.batch}
                        onChange={handleInputChange}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        name="expiry"
                        value={newItem.expiry}
                        onChange={handleInputChange}
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        name="inUse"
                        checked={newItem.inUse}
                        onChange={(e) =>
                          setNewItem({ ...newItem, inUse: e.target.checked })
                        }
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline-success"
                        size="sm"
                        // todo - add onClick to submission func
                        // onClick={() => {
                        //   handleShow();
                        // }}
                        className="rounded-edge-button-right"
                      >
                        <SaveIcon />
                      </Button>
                    </td>
                  </tr>
                )}
                {items?.length ? (
                  <>
                    {items.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr className="text-center italic-text">
                          <td>{index + 1}</td>
                          <td>Order ID</td>
                          <td>Order reception date</td>
                          <td>{item.batch}</td>
                          <td>{item.expiry}</td>
                          <td>{item.inUse}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  <span></span>
                )}
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
