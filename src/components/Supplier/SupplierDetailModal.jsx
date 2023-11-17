import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Col, Spinner } from "react-bootstrap";
import LinkIcon from "@mui/icons-material/Link";
import Table from "react-bootstrap/Table";
import DeleteButton from "../Generic/DeleteButton";
import {
  deleteSupplier,
  getSupplierDetails,
} from "../../clients/supplier_client";
import SupplierModal from "./SupplierModal";
import ProductDetailModal from "../Product/ProductDetailModal";
import ManufacturerDetailModal from "../Manufacturer/ManufacturerDetailModal";
import { showToast } from "../../config_and_helpers/helpers";

const SupplierDetailModal = ({ supplierObj, updateSuppliers, supplierId }) => {
  const { token } = useContext(AppContext);
  const isLoadingRef = useRef(false);
  const [show, setShow] = useState(false);
  const [supplier, setSupplier] = useState(supplierObj);
  const supplierIdToUse = supplierObj ? supplierObj.id : supplierId;

  const fetchSupplier = () => {
    isLoadingRef.current = true;
    getSupplierDetails(token, supplierIdToUse, setSupplier).then((response) => {
      isLoadingRef.current = false;
    });
  };

  useEffect(() => {
    if (!supplier && supplierIdToUse) {
      fetchSupplier();
    }
  }, []);

  const handleEdit = () => {
    if (updateSuppliers) {
      updateSuppliers();
    }
    fetchSupplier();
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
      {supplier && (
        <>
          <Button variant="link" onClick={handleShow}>
            {supplier.name}
          </Button>
          <Modal
            show={show}
            onHide={() => setShow(false)}
            aria-labelledby="product-modal"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>{supplier.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Container>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Website:</p>
                  </Col>
                  <Col>
                    <a
                      href={supplier.website}
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
                    <p className="fs-6 fw-bold">Office Email:</p>
                  </Col>
                  <Col>
                    <p> {supplier.email}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Office Phone:</p>
                  </Col>
                  <Col>
                    <p className="fs-6">
                      {supplier.phone_prefix}-{supplier.phone_suffix}
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Manufacturers: </p>
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
                    {supplier?.manufacturers?.length ? (
                      <>
                        {supplier.manufacturers.map((manufacturer, index) => (
                          <React.Fragment key={index}>
                            <tr className="text-center italic-text">
                              <td>{index + 1}</td>
                              <td>
                                <ManufacturerDetailModal
                                  manufacturerId={manufacturer.id}
                                />
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
                    {supplier?.products?.length ? (
                      <>
                        {supplier.products.map((product, index) => (
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
                  <SupplierModal
                    supplierObj={supplier}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>
                <DeleteButton
                  objectType="supplier"
                  objectName={supplier.name}
                  objectId={supplier.id}
                  deleteFetchFunc={deleteSupplier}
                  onSuccessfulDelete={updateSuppliers}
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
export default SupplierDetailModal;
