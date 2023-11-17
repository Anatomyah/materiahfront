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
import { showToast } from "../../config_and_helpers/helpers";

const QuoteDetailModal = ({ quoteObj, updateQuotes, quoteId }) => {
  const { token } = useContext(AppContext);
  const isLoadingRef = useRef(false);
  const [show, setShow] = useState(false);
  const [quote, setQuote] = useState(quoteObj);
  const quoteIdToUse = quoteObj ? quoteObj.id : quoteId;

  const fetchQuote = () => {
    isLoadingRef.current = true;
    getQuoteDetails(token, quoteIdToUse, setQuote).then((response) => {
      isLoadingRef.current = false;
    });
  };

  useEffect(() => {
    if (!quote && quoteIdToUse) fetchQuote();
  }, []);

  const handleEdit = () => {
    if (updateQuotes) {
      updateQuotes();
    }
    fetchQuote();
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
      {quote && (
        <>
          <Button variant="link" onClick={handleShow}>
            {quote.id}
          </Button>
          <Modal
            show={show}
            onHide={() => setShow(false)}
            aria-labelledby="product-modal"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Quote {quote.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Container>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Request Date:</p>
                  </Col>
                  <Col>
                    <p className="fs-6">{quote.request_date}</p>
                  </Col>
                </Row>
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
                    {quote.items.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr className="text-center italic-text">
                          <td>{index + 1}</td>
                          <td>
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
                <div className="me-2">
                  <QuoteModal
                    quoteObj={quote}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>
                <DeleteButton
                  objectType="quote"
                  objectName={quote.id}
                  objectId={quote.id}
                  deleteFetchFunc={deleteQuote}
                  onSuccessfulDelete={updateQuotes}
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
export default QuoteDetailModal;
