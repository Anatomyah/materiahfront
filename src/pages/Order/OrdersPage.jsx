import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../../components/Generic/PaginatorComponent";
import { AppContext } from "../../App";
import { getOrders } from "../../clients/order_client";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const { token } = useContext(AppContext);
  const nav = useNavigate();
  const [orders, setOrders] = useState();
  const [errorMessages, setErrorMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getOrders(token, setOrders, setTotalPages, currentPage).then((response) => {
      if (!response) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const goToOrderDetails = (order) => {
    console.log(order);
    nav(`/order-details/${order.id}`, {
      state: { order },
    });
  };

  if (!orders) {
    return "Loading...";
  }

  return (
    <div>
      {orders.map((order) => (
        <span
          key={order.id}
          className="text-decoration-underline text-primary"
          style={{ cursor: "pointer" }}
          onClick={() => goToOrderDetails(order)}
        >
          {order.id}
        </span>
      ))}
      {!errorMessages && (
        <ul>
          {errorMessages.map((error, id) => (
            <li key={id} className="text-danger fw-bold">
              {error}
            </li>
          ))}
        </ul>
      )}

      <PaginatorComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
export default OrdersPage;
