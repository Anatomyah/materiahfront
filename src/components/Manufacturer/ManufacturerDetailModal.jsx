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

/**
 * ManufacturerDetailModal Component.
 *
 * This is a modal component that displays detailed information about a specific manufacturer.
 * It shows their name, website, the suppliers and the products associated with them.
 * There are options to delete the manufacturer or edit their information.
 * Clicking on the suppliers or products linked in the modal opens further modals with more details about the clicked entity.
 *
 * @component
 *
 * @prop {object} manufacturerObj - The detailed information of the manufacturer.
 * @prop {Function} updateManufacturers - The function to update the manufacturer list after the manufacturer's information has been edited or the manufacturer has been deleted.
 * @prop {number | string} manufacturerId - The id of the manufacturer.
 *
 * @example
 *
 * const manufacturerObj = {
 *   <Insert manufacturer data here>
 * };
 * let manufacturerId;
 * const updateManufacturers = () => {
 *   // Fetch the updated manufacturers here
 * };
 *
 * return (
 *   <ManufacturerDetailModal
 *     manufacturerObj={manufacturerObj}
 *     updateManufacturers={updateManufacturers}
 *     manufacturerId={manufacturerId}
 *   />
 * );
 *
 */
const ManufacturerDetailModal = ({
  manufacturerObj,
  updateManufacturers,
  manufacturerId,
}) => {
  // useContext retrieves the token value that is required for fetching API data
  const { token } = useContext(AppContext);
  // useRef creates a reference boolean variable that persists between re-renders; used to track whether data is being fetched
  const isLoadingRef = useRef(false);
  // useState creates a state variable to control the visibility of the modal; initially set to false
  const [show, setShow] = useState(false);
  // useState creates a state variable to store the details of the manufacturer; initially set to the passed manufacturerObj prop
  const [manufacturer, setManufacturer] = useState(manufacturerObj);
  // Checks if a manufacturer object was passed as a prop;
  // if true, use the id from the manufacturer object, otherwise use the manufacturerId prop
  const manufacturerIdToUse = manufacturerObj
    ? manufacturerObj.id
    : manufacturerId;

  // UseEffect to update the state on re-renders
  useEffect(() => {
    setManufacturer(manufacturerObj);
  }, [manufacturerObj]);

  // Function to fetch manufacturer details
  const fetchManufacturer = () => {
    isLoadingRef.current = true;
    getManufacturerDetails(token, manufacturerIdToUse, setManufacturer).then(
      (response) => {
        isLoadingRef.current = false;
      },
    );
  };

  // UseEffect to fetch manufacturer details on first render if no manufacturerObj is passed
  useEffect(() => {
    if (!manufacturer && manufacturerIdToUse) {
      fetchManufacturer();
    }
  }, []);

  // Function to handle updating manufacturers
  const handleEdit = () => {
    if (updateManufacturers) {
      updateManufacturers();
    }
    fetchManufacturer();
  };

  // Function to handle closing the modal
  const handleClose = () => setShow(false);

  // Function to handle showing the modal
  const handleShow = () => setShow(true);

  // Show loading spinner while data is being fetched
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
          {/* Button to open the modal */}
          <Button variant="link" onClick={handleShow}>
            {manufacturer.name}
          </Button>

          {/* Manufacturer detail modal */}
          <Modal
            show={show}
            onHide={() => setShow(false)}
            aria-labelledby="product-modal"
            size="lg"
          >
            <Modal.Header closeButton>
              {/* Modal title */}
              <Modal.Title>{manufacturer.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Container>
                {/* Display website */}
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Website:</p>
                  </Col>
                  <Col>
                    {/* Website link */}
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

                {/* Display supplier */}
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Suppliers: </p>
                  </Col>
                </Row>

                {/* Supplier details */}
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
                                {/* Supplier detail modal */}
                                <SupplierDetailModal supplierId={supplier.id} />
                              </td>
                              <td>
                                {/* Supplier website link */}
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

                {/* Display products */}
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Products: </p>
                  </Col>
                </Row>

                {/* Product details */}
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
                                {/* Product detail modal */}
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
                  {/* Manufacturer edit modal */}
                  <ManufacturerModal
                    manufacturerObj={manufacturer}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>

                {/* Manufacturer delete button */}
                <DeleteButton
                  objectType="manufacturer"
                  objectName={manufacturer.name}
                  objectId={manufacturer.id}
                  deleteFetchFunc={deleteManufacturer}
                  onSuccessfulDelete={updateManufacturers}
                />
              </div>

              {/* Close button */}
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
