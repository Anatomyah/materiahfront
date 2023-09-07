import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../components/PaginatorComponent";
import { AppContext } from "../App";
import { getOrders } from "../client/order_client";

const OrdersPage = () => {
  const { token } = useContext(AppContext);
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

  if (!orders) {
    return "Loading...";
  }

  return (
    <div>
      {orders.map((order) => (
        <li key={order.id}>{order.id}</li>
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
