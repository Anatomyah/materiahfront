import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../../components/Generic/PaginatorComponent";
import { AppContext } from "../../App";
import { getOrders } from "../../clients/order_client";
import { useNavigate } from "react-router-dom";
import CreateOrderModal from "../../components/Order/CreateOrderModal";
import { getQuotes } from "../../clients/quote_client";
import ScrollingPagination from "../../components/Generic/ScrollingPagination";

const OrdersPage = () => {
  const { token } = useContext(AppContext);
  const nav = useNavigate();
  const [orders, setOrders] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);

  const fetchOrders = () => {
    getOrders(token, setOrders, setTotalPages, currentPage).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });

    if (currentPage >= totalPages) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

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
      {/*{orders.map((order) => (*/}
      {/*  <span*/}
      {/*    key={order.id}*/}
      {/*    className="text-decoration-underline text-primary"*/}
      {/*    style={{ cursor: "pointer" }}*/}
      {/*    onClick={() => goToOrderDetails(order)}*/}
      {/*  >*/}
      {/*    {order.id}*/}
      {/*  </span>*/}
      {/*))}*/}
      <ScrollingPagination fetchItems={fetchOrders} hasMore={hasMore}>
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
      </ScrollingPagination>
      {!errorMessages && (
        <ul>
          {errorMessages.map((error, id) => (
            <li key={id} className="text-danger fw-bold">
              {error}
            </li>
          ))}
        </ul>
      )}

      {/*<PaginatorComponent*/}
      {/*  currentPage={currentPage}*/}
      {/*  totalPages={totalPages}*/}
      {/*  onPageChange={handlePageChange}*/}
      {/*/>*/}
      <CreateOrderModal onSuccessfulCreate={fetchOrders} />
    </div>
  );
};
export default OrdersPage;
