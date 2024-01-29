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
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const HomePage = () => {
  const { notifications, isSupplier } = useContext(AppContext);
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
            {!isSupplier && (
              <h1>
                <Badge pill bg="secondary">
                  Notifications
                </Badge>
              </h1>
            )}
          </Col>
        </Row>
        <Row>
          <Col sm={8} className="d-flex flex-row flex-wrap">
            {!isSupplier && (
              <>
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
              </>
            )}
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
            {!isSupplier && notifications && (
              <div className="scrollable-area">
                {notifications.order_notifications && (
                  <div className="col-md-10 mx-auto notification-box-style">
                    <Button
                      variant="secondary"
                      className="w-100 h-100"
                      style={{ fontSize: "30px", fontWeight: "bold" }}
                      onClick={handleCreateOrder}
                    >
                      <NotificationsActiveIcon
                        fontSize="large"
                        style={{ marginRight: "10px" }}
                      />
                      Re-stocking
                    </Button>
                  </div>
                )}
                {notifications.expiry_notifications && (
                  <div className="col-md-10 mx-auto notification-box-style">
                    <Button
                      variant="secondary"
                      className="w-100 h-100"
                      style={{ fontSize: "30px", fontWeight: "bold" }}
                      onClick={handleCreateOrder}
                    >
                      {
                        <NotificationsActiveIcon
                          fontSize="large"
                          style={{ marginRight: "10px" }}
                        />
                      }
                      Stock Expiry
                    </Button>
                  </div>
                )}
              </div>
            )}
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
