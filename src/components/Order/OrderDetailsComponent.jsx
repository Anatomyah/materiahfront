import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppContext } from "../../App";
import { deleteOrder, getOrderDetails } from "../../clients/order_client";
import DeleteButton from "../Generic/DeleteButton";
import OrderModal from "./OrderModal";

const OrderDetailsComponent = () => {
  const { token } = useContext(AppContext);
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (!order) {
      fetchOrder();
    }
  }, [id, order]);

  const fetchOrder = () => {
    getOrderDetails(token, id, setOrder).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  useEffect(() => {
    console.log(order);
  }, [order]);

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
      <a href={order.quote.quote_url} target="_blank" rel="noopener noreferrer">
        Quote PDF
      </a>
      <div>
        {order.images.map((image) => {
          // Check if the file is a PDF by looking at the URL extension
          const isPdf = image.image_url.toLowerCase().endsWith(".pdf");

          return isPdf ? (
            <a
              href={image.image_url}
              key={image.id}
              target="_blank"
              rel="noopener noreferrer"
            >
              View PDF
            </a>
          ) : (
            <a
              href={image.image_url}
              key={image.id}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={image.image_url}
                alt={`order-${order.id}-image-${image.id}`}
                width="200"
              />
            </a>
          );
        })}
      </div>
      {order && (
        <>
          <OrderModal orderObj={order} onSuccessfulSubmit={fetchOrder} />
          <DeleteButton
            objectType="order"
            objectName={order.id}
            objectId={order.id}
            deleteFetchFunc={deleteOrder}
            returnLocation="orders"
          />
        </>
      )}
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
