import React from "react";
import Table from "react-bootstrap/Table";
import QuoteModal from "./QuoteModal";
import DeleteButton from "../Generic/DeleteButton";
import { deleteQuote } from "../../clients/quote_client";
import { Link } from "react-bootstrap-icons";
import "./QuoteComponentStyle.css";
import QuoteDetailModal from "./QuoteDetailModal";
import OrderDetailModal from "../Order/OrderDetailModal";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import ProductDetailModal from "../Product/ProductDetailModal";
import { Accordion } from "react-bootstrap";

/**
 * Component: QuoteTable
 *
 * @description
 * The QuoteTable component renders a table displaying a list of quotes. Each row in the table
 * represents a quote and includes actions like viewing, editing, and deleting the quote. It also
 * provides a detailed view of each quote item using an accordion.
 *
 * @prop {Array} quoteList - Array of quote objects to display in the table.
 * @prop {Function} handleEdit - Function to call when a quote is edited.
 *
 */
const QuoteTable = ({ quoteList, handleEdit }) => {
  return (
    <Table striped bordered hover>
      {/* Table header defining the columns */}
      <thead>
        <tr className="text-center">
          {/* Column headers like ID, Dates, URL, etc. */}
          <th>#</th>
          <th>ID</th>
          <th>Request Date</th>
          <th>Creation/Reception Date</th>
          <th>Last Updated</th>
          <th>URL</th>
          <th>Order</th>
          <th>Supplier</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* Mapping over quoteList to create rows for each quote */}
        {quoteList.map((quote, index) => (
          <React.Fragment key={index}>
            <tr key={index} className="text-center align-middle">
              {/* Rendering individual data cells with quote information */}
              <td>{index + 1}</td>
              <td>
                <QuoteDetailModal quoteId={quote.id} />
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
                  <Link size={"2rem"} />
                </a>
              </td>
              <td>
                <OrderDetailModal orderId={quote?.order} />
              </td>
              <td>
                <SupplierDetailModal supplierId={quote.supplier.id} />
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
                  // Disable quote deletion if quote is related to an order
                  disableDelete={quote.hasOwnProperty("order")}
                  objectType="quoteObj"
                  objectName={quote.id}
                  objectId={quote.id}
                  deleteFetchFunc={deleteQuote}
                  onSuccessfulDelete={handleEdit}
                />
              </td>
            </tr>

            {/* Additional row for accordion with quote items */}
            <tr>
              {/* Accordion for detailed quote item view */}
              <td></td>
              <td>
                <Accordion flush>
                  {/* Accordion item for quote items */}
                  <Accordion.Item eventKey={0}>
                    <Accordion.Header>Quote Items</Accordion.Header>
                    <Accordion.Body>
                      {/* Table for listing quote items */}
                      <Table striped bordered hover>
                        {/* Table header and body for quote items */}
                        <thead>
                          <tr className="text-center bold-italic-text">
                            <td>#</td>
                            <td>Product</td>
                            <td>Quantity</td>
                            <td>Price</td>
                          </tr>
                        </thead>
                        <tbody>
                          {quote.items.map((item, index) => (
                            <React.Fragment key={index}>
                              <tr className="text-center italic-text">
                                <td>{index + 1}</td>
                                <td>
                                  <ProductDetailModal
                                    productId={item.product.id}
                                  />
                                </td>
                                <td>{item.quantity}</td>
                                <td>{item.price}</td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </Table>
  );
};
export default QuoteTable;
