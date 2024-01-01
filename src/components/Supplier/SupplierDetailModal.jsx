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

/**
 * `SupplierDetailModal` is a functional component that displays a modal with detailed information about a supplier.
 * It fetches the supplier data via the supplier details API on mount if supplier data is not passed as a prop.
 * It also provides options to edit or delete the supplier data.
 *
 * @component
 * @prop {Object} supplierObj - The supplier object to display in the modal, if not passed, the data will be fetched using supplierId
 * @prop {Function} updateSuppliers - The function to run after a supplier has been edited or deleted
 * @prop {string} supplierId - The ID of the supplier to fetch data for, used if supplierObj is not passed
 *
 * @example
 * <SupplierDetailModal supplierObj={supplier} updateSuppliers={handleEdit} supplierId={supplierId} />
 */
const SupplierDetailModal = ({ supplierObj, updateSuppliers, supplierId }) => {
  const { token } = useContext(AppContext); // Fetching the token from the AppContext
  const isLoadingRef = useRef(false); // Reference variable to hold loading state
  const [show, setShow] = useState(false); // State-variable for handling the visibility of the modal
  const [supplier, setSupplier] = useState(supplierObj); // State-variable for holding supplier data
  const supplierIdToUse = supplierObj ? supplierObj.id : supplierId; // deciding the supplierId to be used

  // Function to fetch supplier details
  const fetchSupplier = () => {
    isLoadingRef.current = true; // Setting loading state to true before API call
    getSupplierDetails(token, supplierIdToUse, setSupplier).then((response) => {
      isLoadingRef.current = false; // Setting loading state to false after API call
    });
  };

  // useEffect to call fetchSupplier function if supplier data is not present
  useEffect(() => {
    if (!supplier && supplierIdToUse) {
      fetchSupplier();
    }
  }, []);

  // Function to handle data update
  const handleEdit = () => {
    if (updateSuppliers) {
      // If updateSuppliers function is provided, call it
      updateSuppliers();
    }
    fetchSupplier(); // Refetch supplier data
  };

  const handleClose = () => setShow(false); // Function to hide the modal
  const handleShow = () => setShow(true); // Function to show the modal

  // If  isLoadingRef is true, show the spinner
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
      {supplier && ( // If the supplier data is available, render the following JSX
        <>
          // Button to open the modal
          <Button variant="link" onClick={handleShow}>
            {" "}
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
                {/*
                Using a Bootstrap Container for nice margins and padding.
                Below are Rows and Columns for each supplier attribute.
                Each Row contains two Columns - one for the attribute name and one for the attribute value.
                Below this are tables for suppliers' manufacturers and products,
                with conditional rendering based on whether the respective arrays are not empty.
                In the tables, each row corresponds to a manufacturer or product.
                */}
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
                // Two buttons - one to open the supplier edit modal, and one to
                delete the supplier
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
              // A button to close the modal
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
