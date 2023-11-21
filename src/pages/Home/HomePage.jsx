import React, { useContext, useState } from "react";
import { AppContext } from "../../App";
import "./HomeStyle.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Badge, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import ProductModal from "../../components/Product/ProductModal";
import OrderModal from "../../components/Order/OrderModal";
import QuoteModal from "../../components/Quote/QuoteModal";
import UpdateAmountModal from "../../components/Product/UpdateAmountModal";
import NotificationCard from "../../components/Generic/NotificationCard";

const HomePage = () => {
  const { notifications } = useContext(AppContext);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);

  const handleCreateProduct = () => {
    setShowProductModal(true);
  };

  const handleCreateOrder = () => {
    setShowOrderModal(true);
  };

  const handleCreateQuote = () => {
    setShowQuoteModal(true);
  };

  const handleUpdateStock = () => {
    setShowUpdateStockModal(true);
  };

  return (
    <div className="background-image-home">
      <div className="overlay"></div>
      <Container className="py-5 content">
        <Row>
          <Col sm={8} className="text-center">
            <h1>
              <Badge pill bg="secondary">
                Quick Actions
              </Badge>
            </h1>
          </Col>
          <Col sm={4} className="text-center">
            <h1>
              <Badge pill bg="secondary">
                Order Notifications
              </Badge>
            </h1>
          </Col>
        </Row>
        <Row>
          <Col sm={8} className="d-flex flex-row flex-wrap">
            <div className="col-md-5 mx-auto home-box-style">
              <Button
                variant="secondary"
                className="w-100 h-100"
                style={{ fontSize: "30px", fontWeight: "bold" }}
                onClick={handleCreateOrder}
              >
                Receive Order
              </Button>
            </div>
            <div className="col-md-5 mx-auto home-box-style">
              <Button
                variant="secondary"
                className="w-100 h-100"
                style={{ fontSize: "30px", fontWeight: "bold" }}
                onClick={handleUpdateStock}
              >
                Update Stock
              </Button>
            </div>
            <div className="col-md-5 mx-auto home-box-style">
              <Button
                variant="secondary"
                className="w-100 h-100"
                style={{ fontSize: "30px", fontWeight: "bold" }}
                onClick={handleCreateQuote}
              >
                Create Quote
              </Button>
            </div>
            <div className="col-md-5 mx-auto home-box-style">
              <Button
                variant="secondary"
                className="w-100 h-100"
                style={{ fontSize: "30px", fontWeight: "bold" }}
                onClick={handleCreateProduct}
              >
                Create Product
              </Button>
            </div>
          </Col>
          <Col sm={4}>
            <div className="scrollable-area">
              {notifications &&
                notifications.map((notification) => (
                  <NotificationCard
                    key={notification.pk}
                    props={{
                      catNum: notification.fields.product_cat_num,
                      productName: notification.fields.product_name,
                      supplierName: notification.fields.supplier_name,
                      currentStock: notification.fields.current_stock,
                      lastOrdered: notification.fields.last_ordered,
                      avgOrderTime: notification.fields.avg_order_time,
                    }}
                  />
                ))}
            </div>
          </Col>
        </Row>
      </Container>
      {showProductModal && (
        <ProductModal
          homeShowModal={showProductModal}
          setHomeShowModal={setShowProductModal}
        />
      )}
      {showOrderModal && (
        <OrderModal
          homeShowModal={showOrderModal}
          setHomeShowModal={setShowOrderModal}
        />
      )}
      {showQuoteModal && (
        <QuoteModal
          homeShowModal={showQuoteModal}
          setHomeShowModal={setShowQuoteModal}
        />
      )}
      {showUpdateStockModal && (
        <UpdateAmountModal
          homeShowModal={showUpdateStockModal}
          setHomeShowModal={setShowUpdateStockModal}
        />
      )}
    </div>
  );
};
export default HomePage;
