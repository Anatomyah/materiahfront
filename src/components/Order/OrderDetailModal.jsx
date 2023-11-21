import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Col, Spinner } from "react-bootstrap";
import DeleteButton from "../Generic/DeleteButton";
import { deleteOrder, getOrderDetails } from "../../clients/order_client";
import OrderModal from "./OrderModal";
import QuoteDetailModal from "../Quote/QuoteDetailModal";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CarouselComponent from "../Generic/CarouselComponent";
import ProductDetailModal from "../Product/ProductDetailModal";
import Table from "react-bootstrap/Table";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";

const OrderDetailModal = ({ orderObj, updateOrders, orderId }) => {
  const { token } = useContext(AppContext);
  const isLoadingRef = useRef(false);
  const [show, setShow] = useState(false);
  const [order, setOrder] = useState(orderObj);
  const orderIdToUse = orderObj ? orderObj.id : orderId;

  const fetchOrder = () => {
    isLoadingRef.current = true;
    getOrderDetails(token, orderIdToUse, setOrder).then((response) => {
      isLoadingRef.current = false;
    });
  };

  useEffect(() => {
    if (!order && orderIdToUse) {
      fetchOrder();
    }
  }, []);

  const handleEdit = () => {
    if (updateOrders) {
      updateOrders();
    }
    fetchOrder();
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
      {order && (
        <>
          <Button variant="link" onClick={handleShow}>
            {order.id}
          </Button>
          <Modal
            show={show}
            onHide={() => setShow(false)}
            aria-labelledby="product-modal"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Order {order.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Container>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Quote:</p>
                  </Col>
                  <Col className="d-flex flex-row align-items-center me-3">
                    <QuoteDetailModal quoteId={order.quote.id} />
                    <span className="ms-2 me-3">{"|"}</span>
                    <a href={order.quote.quote_url} className="link-">
                      <PictureAsPdfIcon />
                    </a>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Arrival Date:</p>
                  </Col>
                  <Col>
                    <p className="fs-6">{order.arrival_date}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Received By:</p>
                  </Col>
                  <Col>
                    <p className="fs-6">{order.received_by}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Supplier: </p>
                  </Col>
                  <Col>
                    <SupplierDetailModal supplierId={order.supplier.id} />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className="fs-6 fw-bold">Status: </p>
                  </Col>
                  <Col>
                    <p className="fs-6">{order.quote.status}</p>
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
                      <th>Batch</th>
                      <th>Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr className="text-center italic-text">
                          <td>{index + 1}</td>
                          <td key={index}>
                            <ProductDetailModal productId={item.product.id} />
                          </td>
                          <td>{item.quantity}</td>
                          <td>{item.batch}</td>
                          <td>{item.expiry}</td>
                          <td>{item.status}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </Container>
              <CarouselComponent images={order.images} />
            </Modal.Body>
            <Modal.Footer className="d-flex flex-row justify-content-between">
              <div className="d-flex flex-row">
                <div className="me-2">
                  <OrderModal
                    orderObj={order}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>
                <DeleteButton
                  objectType="order"
                  objectName={order.id}
                  objectId={order.id}
                  deleteFetchFunc={deleteOrder}
                  onSuccessfulDelete={updateOrders}
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
export default OrderDetailModal;
