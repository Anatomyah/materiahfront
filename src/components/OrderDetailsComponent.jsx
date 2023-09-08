import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AppContext } from "../App";
import { getOrderDetails } from "../clients/order_client";

const OrderDetailsComponent = () => {
  const { token } = useContext(AppContext);
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(
    location.state ? location.state.quote : null,
  );
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (!order) {
      getOrderDetails(token, id, setOrder).then((response) => {
        if (!response) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    console.log(order);
  }, [order]);

  if (!order) {
    return "Order details not available";
  }
  //   0
  // :
  // arrival_date
  // :
  // "2023-08-22"
  // id
  // :
  // 5
  // items
  // :
  // [{…}]
  // quote
  // :
  // 3
  // quote_pdf
  // :
  // "/media/quotes_pdfs/materiah.drawio_lXxTjbL.pdf"
  // supplier
  // :
  // {id: 1, name: 'Supplier 1'}
  // [[Prototype]]
  // :
  // Object
  // length
  // :
  // 1

  return (
    <div>
      <h1>{order.id}</h1>
      <h1>{order.arrival_date}</h1>
      <Link to={`/supplier-details/${order.supplier.id}`}>
        {order.supplier.name}
      </Link>
      {order.items.map((item) => (
        <div key={item.product.id}>
          <h1>{item.product.cat_num}</h1>
          <p>{item.price}</p>
        </div>
      ))}
      <Link to={`/quote-details/${order.quote}`}>{order.quote}</Link>
      #todo - make sure link works
      <a href={order.quote_pdf} target="_blank" rel="noopener noreferrer">
        Quote PDF
      </a>
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
