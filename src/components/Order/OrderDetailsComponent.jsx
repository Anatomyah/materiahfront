import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AppContext } from "../../App";
import { deleteOrder, getOrderDetails } from "../../clients/order_client";
import EditOrderModal from "./EditOrderModal";
import DeleteButton from "../Generic/DeleteButton";

const OrderDetailsComponent = () => {
  const { token } = useContext(AppContext);
  const { id } = useParams();
  const location = useLocation();
  const [modalKey, setModalKey] = useState(0);
  const [order, setOrder] = useState(
    location.state ? location.state.quote : null,
  );
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (!order) {
      getOrderDetails(token, id, setOrder).then((response) => {
        if (response && !response.success) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }, [id]);

  if (!order) {
    return "Order details not available";
  }

  return (
    <div>
      <h1>{order.id}</h1>
      <h1>{order.arrival_date}</h1>
      <h1>Status: {order.quote.status}</h1>
      <h1>{order.received_by}</h1>
      <Link to={`/supplier-details/${order.supplier.id}`}>
        {order.supplier.name}
      </Link>
      {order.items.map((item) => (
        <div key={item.product.id}>
          <h1>{item.product.cat_num}</h1>
          <h1>{item.status}</h1>
          {item.status !== "OK" && <h1>{item.issue_detail}</h1>}
        </div>
      ))}
      <Link to={`/quote-details/${order.quote.id}`}>{order.quote.id}</Link>
      <a
        href={order.quote.quote_file}
        target="_blank"
        rel="noopener noreferrer"
      >
        Quote PDF
      </a>
      <a href={order.receipt_img} target="_blank" rel="noopener noreferrer">
        Receipt
      </a>
      <EditOrderModal
        orderObj={order}
        onSuccessfulUpdate={setOrder}
        key={modalKey}
        resetModal={() => setModalKey((prevKey) => prevKey + 1)}
      />
      <DeleteButton
        objectType="order"
        objectName={order.id}
        objectId={order.id}
        deleteFetchFunc={deleteOrder}
        returnLocation="orders"
      />
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
export default OrderDetailsComponent;
