import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { getOrders } from "../../clients/order_client";
import { useNavigate } from "react-router-dom";
import CreateOrderModal from "../../components/Order/CreateOrderModal";
import TextField from "@mui/material/TextField";
import InfiniteScroll from "react-infinite-scroller";

const OrdersPage = () => {
  const { token } = useContext(AppContext);
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const fetchOrders = ({ searchValue = "", nextPage = null } = {}) => {
    getOrders(token, setOrders, {
      searchInput: searchValue,
      nextPage: nextPage,
    }).then((response) => {
      if (response && response.success) {
        if (response.reachedEnd) {
          setHasMore(false);
        } else {
          setNextPageUrl(response.nextPage);
          setHasMore(true);
        }
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  useEffect(() => {
    fetchOrders({
      searchValue: searchInput,
      nextPage: null,
    });
  }, [searchInput]);

  const handleSearchInput = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      setSearchInput(value);
    }, 2000);
    setNextPageUrl(null);
    setTypingTimeout(newTimeout);
  };

  const goToOrderDetails = (order) => {
    console.log(order);
    nav(`/order-details/${order.id}`, {
      state: { order },
    });
  };

  if (!orders.length) {
    return "Loading...";
  }

  return (
    <div>
      <CreateOrderModal onSuccessfulCreate={fetchOrders} />
      <TextField
        id="outlined-helperText"
        label="Free text search"
        onChange={(e) => handleSearchInput(e.target.value)}
      />
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          fetchOrders({
            searchValue: searchInput,
            nextPage: nextPageUrl,
          });
        }}
        hasMore={hasMore}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        {orders.map((order) => (
          <span
            key={order.id}
            className="text-decoration-underline text-primary"
            style={{ cursor: "pointer", minHeight: 500, display: "block" }}
            onClick={() => goToOrderDetails(order)}
          >
            {order.id}
          </span>
        ))}
      </InfiniteScroll>
      {!errorMessages && (
        <ul>
          {errorMessages.map((error, id) => (
            <li key={id} className="text-danger fw-bold">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default OrdersPage;
