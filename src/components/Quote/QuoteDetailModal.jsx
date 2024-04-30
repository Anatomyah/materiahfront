import React, { useContext, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Col, Spinner } from "react-bootstrap";
import LinkIcon from "@mui/icons-material/Link";
import DeleteButton from "../Generic/DeleteButton";
import { deleteQuote, getQuoteDetails } from "../../clients/quote_client";
import { AppContext } from "../../App";
import QuoteModal from "./QuoteModal";
import OrderDetailModal from "../Order/OrderDetailModal";
import ProductDetailModal from "../Product/ProductDetailModal";
import Table from "react-bootstrap/Table";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";

/**
 * Component: QuoteDetailModal
 * Description: This component renders a detailed view of a quote in a modal.
 * Props:
 *   - quoteObj: Object containing the initial quote data.
 *   - updateQuotes: Function to update the quotes list after changes.
 *   - quoteId: The ID of the quote to be displayed.
 * Usage: This component is used to provide an in-depth view of quote details and allows for editing and deleting the quote.
 */
const QuoteDetailModal = ({ quoteObj, updateQuotes, quoteId }) => {
  // useContext to access global state, useRef for mutable flag, useState for local state management
  const { token } = useContext(AppContext);
  const isLoadingRef = useRef(false);
  const [show, setShow] = useState(false);
  const [quote, setQuote] = useState(quoteObj);
  const quoteIdToUse = quoteObj ? quoteObj.id : quoteId;

  /**
   * Function: fetchQuote
   * Description: Fetches quote details from the server and updates the component state.
   * Logic:
   *  - Sets isLoadingRef to true before fetching.
   *  - Calls getQuoteDetails with token, quoteIdToUse, and setQuote as arguments.
   *  - Sets isLoadingRef to false after fetching.
   */

  // UseEffect to update the state on re-renders
  useEffect(() => {
    setQuote(quoteObj);
  }, [quoteObj]);

  const fetchQuote = () => {
    isLoadingRef.current = true;
    getQuoteDetails(token, quoteIdToUse, setQuote).then(() => {
      isLoadingRef.current = false;
    });
  };

  // useEffect to fetch quote details on component mount if quote data is not provided
  useEffect(() => {
    if (!quote && quoteIdToUse) fetchQuote();
  }, []);

  // Function handlers for editing, showing, and closing the modal
  const handleEdit = () => {
    if (updateQuotes) {
      updateQuotes();
    }
    fetchQuote();
  };

  // Function to close the modal.
  const handleClose = () => setShow(false);

  // Function to open the modal.
  const handleShow = () => setShow(true);

  // Render a spinner while loading
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
      {/* Conditionally render the content only if the quote data is available */}
      {quote && (
        <>
          {/* Button to trigger the modal display */}
          <a href="#" onClick={handleShow}>
            {quote.id}
          </a>

          {/* Modal component to display quote details */}
          <Modal
            show={show}
            onHide={handleClose}
            aria-labelledby="quote-detail-modal"
            size="lg"
          >
            <Modal.Header closeButton>
              {/* Modal title displaying the quote ID */}
              <Modal.Title>Quote {quote.id}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Container>
                {/* Displaying various details of the quote in a structured format */}
                <Row>
                  <Col>
                    {/* Label for request date */}
                    <p className="fs-6 fw-bold">Request Date:</p>
                  </Col>
                  <Col>
                    {/* Value for request date */}
                    <p className="fs-6">{quote.request_date}</p>
                  </Col>
                </Row>
                {/* Additional rows follow the same structure for different quote details */}
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Creation/Reception Date:</p>
                  </Col>
                  <Col>
                    <p className="fs-6">{quote.creation_date}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Last Updated:</p>
                  </Col>
                  <Col>
                    <p className="fs-6">{quote.last_updated}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">URL: </p>
                  </Col>
                  <Col>
                    <a
                      href={quote.quote_url}
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
                    <p className="fs-6 fw-bold">Order: </p>
                  </Col>
                  <Col>
                    <OrderDetailModal orderId={quote?.order} />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Supplier: </p>
                  </Col>
                  <Col>
                    <SupplierDetailModal supplierId={quote.supplier.id} />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Status: </p>
                  </Col>
                  <Col>
                    <p className="fs-6">{quote.status}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Quote Items: </p>
                  </Col>
                </Row>

                {/* Displaying quote items in a table format */}
                <Table striped bordered hover>
                  <thead>
                    <tr className="text-center">
                      <th>#</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Mapping over each item in the quote to create a table row */}
                    {quote.items.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr className="text-center italic-text">
                          <td>{index + 1}</td>
                          <td>
                            {/* Displaying product details in a modal */}
                            <ProductDetailModal productId={item.product.id} />
                          </td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </Container>
            </Modal.Body>

            <Modal.Footer className="d-flex flex-row justify-content-between">
              <div className="d-flex flex-row">
                {/* Edit button for the quote */}
                <div className="me-2">
                  <QuoteModal
                    quoteObj={quote}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>
                {/* Delete button for the quote */}
                <DeleteButton
                  // Disable deletion if quote is related to an order
                  disableDelete={quote.hasOwnProperty("order")}
                  objectType="quote"
                  objectName={quote.id}
                  objectId={quote.id}
                  deleteFetchFunc={deleteQuote}
                  onSuccessfulDelete={updateQuotes}
                />
              </div>
              {/* Close button for the modal */}
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
export default QuoteDetailModal;
