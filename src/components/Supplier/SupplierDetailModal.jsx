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
 * SupplierDetailModal is a component that displays the details of a supplier in a modal.
 * It takes the following props:
 *
 * @param {Object} supplierObj - The supplier object containing the supplier data.
 * @param {function} updateSuppliers - A function to update the suppliers list after a change is made.
 * @param {string} supplierId - The ID of the supplier.
 * @param {function} clearSearchValue - A function to clear the search value after a change is made.
 * @param {boolean} smallerFont - A boolean value indicating whether the font size should be smaller.
 */
const SupplierDetailModal = ({
  supplierObj,
  updateSuppliers,
  supplierId,
  clearSearchValue,
  smallerFont,
}) => {
  const { token } = useContext(AppContext); // Fetching the token from the AppContext
  const isLoadingRef = useRef(false); // Reference variable to hold loading state
  const [show, setShow] = useState(false); // State-variable for handling the visibility of the modal
  const [supplier, setSupplier] = useState(supplierObj); // State-variable for holding supplier data
  const supplierIdToUse = supplierObj ? supplierObj.id : supplierId; // deciding the supplierId to be used

  // UseEffect to update the state on re-renders
  useEffect(() => {
    setSupplier(supplierObj);
  }, [supplierObj]);

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
          {/* Button to open the modal */}
          <Button
            variant="link"
            onClick={handleShow}
            {...(smallerFont ? { style: { fontSize: "12px" } } : {})}
          >
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
                    <p className="fs-6 fw-bold">Main Email:</p>
                  </Col>
                  <Col>
                    <p> {supplier.email}</p>
                  </Col>
                </Row>
                {supplier?.secondary_emails && (
                  <Row>
                    <Col>
                      <p className="fs-6 fw-bold">Secondary Emails:</p>
                    </Col>
                    <Col>
                      {supplier.secondary_emails.map(
                        (secondaryEmail, index) => (
                          <span key={index}>
                            {secondaryEmail.email}
                            {index < supplier.secondary_emails.length - 1
                              ? ", "
                              : ""}
                          </span>
                        ),
                      )}
                    </Col>
                  </Row>
                )}
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
                {/* Two buttons - one to open the supplier edit modal, and one to
                delete the supplier */}
                <div className="me-2">
                  <SupplierModal
                    supplierObj={supplier}
                    onSuccessfulSubmit={handleEdit}
                    clearSearchValue={clearSearchValue}
                  />
                </div>
                <DeleteButton
                  objectType="supplier"
                  objectName={supplier.name}
                  objectId={supplier.id}
                  deleteFetchFunc={deleteSupplier}
                  onSuccessfulDelete={updateSuppliers}
                  clearSearchValue={clearSearchValue}
                />
              </div>
              {/* A button to close the modal */}
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
