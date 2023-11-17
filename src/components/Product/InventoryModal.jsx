import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Col } from "react-bootstrap";
import LinkIcon from "@mui/icons-material/Link";
import CarouselComponent from "../Generic/CarouselComponent";
import ProductModal from "./ProductModal";
import DeleteButton from "../Generic/DeleteButton";
import { deleteProduct } from "../../clients/product_client";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import ManufacturerDetailModal from "../Manufacturer/ManufacturerDetailModal";

const InventoryModal = ({ product, handleEdit, updateProducts }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <Button variant="link" onClick={handleShow}>
        {product.name}
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        aria-labelledby="product-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{product.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                <p className="fs-6 fw-bold">Catalogue Number: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.cat_num}</p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="fs-6 fw-bold">Stock: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.stock}</p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="fs-6 fw-bold">Category: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.category}</p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="fs-6 fw-bold">Supplier: </p>
              </Col>
              <Col>
                <SupplierDetailModal supplierId={product.supplier.id} />
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="fs-6 fw-bold">Manufacturer: </p>
              </Col>
              <Col>
                <ManufacturerDetailModal
                  manufacturerId={product.manufacturer.id}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="fs-6 fw-bold">Unit: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.unit}</p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="fs-6 fw-bold">Volume: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.volume}</p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="fs-6 fw-bold">Storage: </p>
              </Col>
              <Col>
                <p className="fs-6">{product.storage}</p>
              </Col>
            </Row>
            <Row>
              <Col className="mt-1">
                <p className="fs-6 fw-bold">Website Profile: </p>
              </Col>
              <Col>
                <a href={product.url}>
                  <LinkIcon sx={{ fontSize: "36px", alignSelf: "middle" }} />
                </a>
              </Col>
            </Row>
            <hr />
          </Container>

          <CarouselComponent images={product.images} />
        </Modal.Body>
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
