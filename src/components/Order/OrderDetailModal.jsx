import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import DeleteButton from "../Generic/DeleteButton";
import { deleteOrder, getOrderDetails } from "../../clients/order_client";
import OrderModal from "./OrderModal";
import QuoteDetailModal from "../Quote/QuoteDetailModal";
import CarouselComponent from "../Generic/CarouselComponent";
import ProductDetailModal from "../Product/ProductDetailModal";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Col, Spinner } from "react-bootstrap";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

/**
 * OrderDetailModal Component
 *
 * This component takes an order object as props and displays a detailed view of that order in the form of
 * a clickable link that can be opened in a modal. This view includes order information such as
 * the supplier, quote, and items along with their details.
 *
 * @component
 * @prop {object} orderObj The object of the order to be shown in detail view.
 * @prop {function} updateOrders A function to update orders in parent state.
 * @prop {string} orderId A string denoting the order id.
 *
 * @example
 *
 * return (
 *   <OrderDetailModal orderObj={sampleOrderObject} updateOrders={updateOrderListFunction} orderId={"orderid123"} />
 * );
 */
const OrderDetailModal = ({ orderObj, updateOrders, orderId }) => {
  // Hooks for necessary states and context values
  const { token } = useContext(AppContext);
  // Provide a mutable value that exists for the whole lifetime of the component
  const isLoadingRef = useRef(false);
  const [show, setShow] = useState(false);
  const [order, setOrder] = useState(orderObj);
  const orderIdToUse = orderObj ? orderObj.id : orderId;

  // Fetches specific order data
  const fetchOrder = () => {
    isLoadingRef.current = true;
    getOrderDetails(token, orderIdToUse, setOrder).then((response) => {
      isLoadingRef.current = false; // Stop loading after the data is fetched
    });
  };

  // Run fetchOrder on component mount if there is an orderId but no order
  useEffect(() => {
    if (!order && orderIdToUse) {
      fetchOrder();
    }
  }, []);

  // Callback for when the order is edited
  const handleEdit = () => {
    if (updateOrders) {
      updateOrders();
    }
    fetchOrder();
  };

  // Handlers for opening and closing the modal
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // A Bootstrap spinner spins until loading is finished.
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
          {/* Button to open the modal showing order details */}
          <Button variant="link" onClick={handleShow}>
            {order.id}
          </Button>

          {/* The modal itself */}
          <Modal
            show={show}
            onHide={() => setShow(false)} // The onHide prop handles how to close
            aria-labelledby="product-modal"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Order {order.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* The Container, Row, and Col components are from react-bootstrap and used for layout */}
              <Container>
                {/* Various pieces of information about the order are listed here */}
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

              {/* Display any images associated with the order in a carousel */}
              <CarouselComponent images={order.images} />
            </Modal.Body>

            {/* The footer contains buttons that interact with the order */}
            <Modal.Footer className="d-flex flex-row justify-content-between">
              <div className="d-flex flex-row">
                {/* Button to show a modal for editing the order. Triggers handleEdit when the edits are successful */}
                <div className="me-2">
                  <OrderModal
                    orderObj={order}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>

                {/* Button to delete the order. The deleteFetchFunc prop prescribes a function from order_client.js to make the API call */}
                <DeleteButton
                  objectType="order"
                  objectName={order.id}
                  objectId={order.id}
                  deleteFetchFunc={deleteOrder}
                  onSuccessfulDelete={updateOrders} // Triggers the provided onDelete function when the delete operation is successful
                />
              </div>

              {/* Button to close the modal */}
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
