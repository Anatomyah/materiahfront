import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Col, Spinner } from "react-bootstrap";
import LinkIcon from "@mui/icons-material/Link";
import Table from "react-bootstrap/Table";
import ProductDetailModal from "../Product/ProductDetailModal";
import DeleteButton from "../Generic/DeleteButton";
import {
  deleteManufacturer,
  getManufacturerDetails,
} from "../../clients/manufacturer_client";
import ManufacturerModal from "./ManufacturerModal";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";

const ManufacturerDetailModal = ({
  manufacturerObj,
  updateManufacturers,
  manufacturerId,
}) => {
  const { token } = useContext(AppContext);
  const isLoadingRef = useRef(false);
  const [show, setShow] = useState(false);
  const [manufacturer, setManufacturer] = useState(manufacturerObj);
  const manufacturerIdToUse = manufacturerObj
    ? manufacturerObj.id
    : manufacturerId;

  const fetchManufacturer = () => {
    isLoadingRef.current = true;
    getManufacturerDetails(token, manufacturerIdToUse, setManufacturer).then(
      (response) => {
        isLoadingRef.current = false;
      },
    );
  };

  useEffect(() => {
    if (!manufacturer && manufacturerIdToUse) {
      fetchManufacturer();
    }
  }, []);

  const handleEdit = () => {
    if (updateManufacturers) {
      updateManufacturers();
    }
    fetchManufacturer();
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  if (isLoadingRef.current) {
    return (
      <Spinner
        size="lg"
        as="span"
        animation="border"
        role="status"
        aria-hidden="true"
      />
    );
  }

  return (
    <div>
      {manufacturer && (
        <>
          <Button variant="link" onClick={handleShow}>
            {manufacturer.name}
          </Button>
          <Modal
            show={show}
            onHide={() => setShow(false)}
            aria-labelledby="product-modal"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>{manufacturer.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Container>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Website:</p>
                  </Col>
                  <Col>
                    <a
                      href={manufacturer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkIcon
                        sx={{ fontSize: "36px", alignSelf: "middle" }}
                      />
                    </a>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Suppliers: </p>
                  </Col>
                </Row>
                <Table striped bordered hover>
                  <thead>
                    <tr className="text-center">
                      <th>#</th>
                      <th>Name</th>
                      <th>Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manufacturer?.suppliers?.length ? (
                      <>
                        {manufacturer.suppliers.map((supplier, index) => (
                          <React.Fragment key={index}>
                            <tr className="text-center italic-text">
                              <td>{index + 1}</td>
                              <td>
                                <SupplierDetailModal supplierId={supplier.id} />
                              </td>
                              <td>
                                <a
                                  href={supplier.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <LinkIcon
                                    sx={{
                                      fontSize: "36px",
                                      alignSelf: "middle",
                                    }}
                                  />
                                </a>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </>
                    ) : (
                      <span></span>
                    )}
                  </tbody>
                </Table>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Products: </p>
                  </Col>
                </Row>
                <Table striped bordered hover>
                  <thead>
                    <tr className="text-center">
                      <th>#</th>
                      <th>Name</th>
                      <th>Catalogue Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manufacturer?.products?.length ? (
                      <>
                        {manufacturer.products.map((product, index) => (
                          <React.Fragment key={index}>
                            <tr className="text-center italic-text">
                              <td>{index + 1}</td>
                              <td>
                                <ProductDetailModal productId={product.id} />
                              </td>
                              <td>{product.cat_num}</td>
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
            <Modal.Footer className="d-flex flex-row justify-content-between">
              <div className="d-flex flex-row">
                <div className="me-2">
                  <ManufacturerModal
                    manufacturerObj={manufacturer}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>
                <DeleteButton
                  objectType="manufacturer"
                  objectName={manufacturer.name}
                  objectId={manufacturer.id}
                  deleteFetchFunc={deleteManufacturer}
                  onSuccessfulDelete={updateManufacturers}
                />
              </div>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};
export default ManufacturerDetailModal;
