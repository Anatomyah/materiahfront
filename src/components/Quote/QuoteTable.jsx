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
import {
  calculatePriceAfterDiscount,
  formatDateStr,
  formatDecimalNumber,
  getCurrencySymbol,
} from "../../config_and_helpers/helpers";
import { CURRENCY_SYMBOLS } from "../../config_and_helpers/config";

/**
 * Renders a table of quotes with their details and associated actions.
 *
 * @param {Object} props - The props passed to the QuoteTable component.
 * @param {Array} props.quoteList - The list of quotes to be displayed.
 * @param {Function} props.handleEdit - The function to handle edit actions for a quote.
 * @param {Function} props.clearSearchValue - The function to clear the search value.
 *
 * @returns {JSX.Element} The JSX markup for the QuoteTable component.
 */
const QuoteTable = ({ quoteList, handleEdit, clearSearchValue }) => {
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
          <th>Demand Reference</th>
          <th>Budget</th>
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
                <QuoteDetailModal quoteObj={quote} />
              </td>
              <td>{formatDateStr(quote.request_date)}</td>
              <td>
                {quote.creation_date ? formatDateStr(quote.creation_date) : ""}
              </td>
              <td>
                {quote.last_updated ? formatDateStr(quote.last_updated) : ""}
              </td>
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
                <SupplierDetailModal
                  supplierId={quote.supplier.id}
                  smallerFont={true}
                />
              </td>
              <td>{quote.status}</td>
              <td>{quote.corporate_demand_ref}</td>
              <td>{quote.budget}</td>
              <td className="d-flex flex-row justify-content-center">
                <div className="me-2">
                  <QuoteModal
                    quoteObj={quote}
                    onSuccessfulSubmit={handleEdit}
                    clearSearchValue={clearSearchValue}
                    disableEdit={!!quote.order}
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
                  clearSearchValue={clearSearchValue}
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
                            <td>Discount</td>
                            <th>Post-Discount Price</th>
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
                                <td>
                                  {/* Format and display item's price */}
                                  {formatDecimalNumber(item.price)}
                                  {/* If there is a symbol for the item's currency, get and display the currency symbol */}
                                  {CURRENCY_SYMBOLS[item.currency]
                                    ? `${getCurrencySymbol(item.currency)}`
                                    : ""}
                                </td>
                                <td>
                                  {/* If there is a discount for the item, format and display the discount as a percentage, else display null */}
                                  {item?.discount !== null
                                    ? `${formatDecimalNumber(item?.discount)}%`
                                    : null}
                                </td>
                                <td>
                                  {/* If there is a discount for the item, calculate and display the price after discount, else display null */}
                                  {item?.discount !== null
                                    ? calculatePriceAfterDiscount(
                                        item.price,
                                        item?.discount,
                                      )
                                    : null}
                                </td>
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
