import React from "react";
import Table from "react-bootstrap/Table";
import QuoteModal from "./QuoteModal";
import DeleteButton from "../Generic/DeleteButton";
import { deleteQuote } from "../../clients/quote_client";
import LinkIcon from "@mui/icons-material/Link";
import "./QuoteComponentStyle.css";

const QuoteTable = ({ quoteList, handleEdit }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr className="text-center">
          <th>#</th>
          <th>ID</th>
          <th>Request Date</th>
          <th>Reception Date</th>
          <th>Last Updated</th>
          <th>URL</th>
          <th>Order</th>
          <th>Supplier</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {quoteList.map((quote, index) => (
          <React.Fragment key={index}>
            <tr key={index} className="text-center align-middle">
              <td>{index + 1}</td>
              <td>
                <a href={`/order-details/${quote.id}`} className="link-">
                  {quote.id}
                </a>
              </td>
              <td>{quote.request_date}</td>
              <td>{quote.creation_date}</td>
              <td>{quote.last_updated}</td>
              <td>
                <a
                  href={quote.quote_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkIcon />
                </a>
              </td>
              <td>
                <a href={`/order-details/${quote.order}`} className="link-">
                  {quote.order}
                </a>
              </td>
              <td>
                <a
                  href={`/supplier-details/${quote.supplier.id}`}
                  className="link-"
                >
                  {quote.supplier.name}
                </a>
              </td>
              <td>{quote.status}</td>
              <td className="d-flex flex-row justify-content-center">
                <div className="me-2">
                  <QuoteModal
                    quoteObj={quote}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>
                <DeleteButton
                  objectType="quoteObj"
                  objectName={quote.id}
                  objectId={quote.id}
                  deleteFetchFunc={deleteQuote}
                  returnLocation="quotes"
                />
              </td>
            </tr>
            <tr className="bold-italic-text text-center">
              <td className="text"></td>
              <td>#</td>
              <td>Product</td>
              <td>Quantity</td>
              <td>Price</td>
            </tr>
            {quote.items.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="text-center italic-text">
                  <td></td>
                  <td>{index + 1}</td>
                  <td key={index}>
                    <a href={`/product-details/${item.product.id}`}>
                      {item.product.cat_num}
                    </a>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                </tr>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </Table>
  );
};
export default QuoteTable;
