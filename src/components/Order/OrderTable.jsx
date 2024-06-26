import React, { useContext } from "react";
import Table from "react-bootstrap/Table";
import DeleteButton from "../Generic/DeleteButton";
import OrderModal from "./OrderModal";
import { deleteOrder } from "../../clients/order_client";
import { FileEarmarkPdfFill, FileEarmarkTextFill } from "react-bootstrap-icons";
import QuoteDetailModal from "../Quote/QuoteDetailModal";
import OrderDetailModal from "./OrderDetailModal";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import { Accordion } from "react-bootstrap";
import ProductDetailModal from "../Product/ProductDetailModal";
import { OrderDeletionContext } from "../../App";
import { formatDateStr } from "../../config_and_helpers/helpers";

/**
 * Represents a table component for displaying order details.
 *
 * @param {Object} orderTable - The order table component.
 * @param {Array} orderList - An array of order objects.
 * @param {function} handleEdit - A callback function for editing an order.
 * @param {function} clearSearchValue - A function for clearing the search value.
 * @returns {JSX.Element} - The rendered table component.
 */
const OrderTable = ({ orderList, handleEdit, clearSearchValue }) => {
  // Fetches the isOrderDeleted context to manage follow-up actions
  const { toggleOrderDeleted } = useContext(OrderDeletionContext);
  // Callback function on order deletion
  const onOrderDelete = () => {
    toggleOrderDeleted();
    handleEdit();
  };

  return (
    <Table striped bordered hover>
      <thead>
        {/* Table Headers */}
        <tr className="text-center">
          <th>#</th>
          <th>ID</th>
          <th>Quote / Quote File</th>
          <th>Arrival</th>
          <th>Received By</th>
          <th>Receipts</th>
          <th>Supplier</th>
          <th>Status</th>
          <th>Order Reference</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* Mapping through orderList to create several rows in the table. */}
        {orderList.map((order, index) => (
          <React.Fragment key={index}>
            {/* Each row of order */}
            <tr key={index} className="text-center align-middle">
              {/* Various columns like quote, arrival time, receipts etc. */}
              {/* Action Buttons for each order */}
              <td>{index + 1}</td>
              <td>
                <OrderDetailModal orderObj={order} updateOrders={handleEdit} />
              </td>
              <td style={{ width: "200px" }}>
                <div className="d-flex flex-row justify-content-around">
                  <QuoteDetailModal quoteId={order.quote.id} />
                  <a
                    href={order.quote.quote_url}
                    className="link-"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileEarmarkPdfFill size={"1.5rem"} />
                  </a>
                </div>
              </td>
              <td>{formatDateStr(order.arrival_date)}</td>
              <td>{order.received_by}</td>
              <td>
                <div className="justify-content-center d-flex flex-row">
                  {order.images.map((image, index) => (
                    <div key={index}>
                      <a
                        key={index}
                        href={image.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileEarmarkTextFill size={"2rem"} />
                      </a>
                      {index !== order.images.length - 1 && <span>|</span>}
                    </div>
                  ))}
                </div>
              </td>
              <td>
                <SupplierDetailModal
                  supplierId={order.supplier.id}
                  smallerFont={true}
                />
              </td>
              <td>{order.quote.status}</td>
              <td>{order.corporate_order_ref}</td>
              <td className="d-flex flex-row justify-content-center">
                <div className="me-2">
                  <OrderModal
                    orderObj={order}
                    onSuccessfulSubmit={handleEdit}
                    clearSearchValue={clearSearchValue}
                  />
                </div>
                <DeleteButton
                  objectType="order"
                  objectName={order.id}
                  objectId={order.id}
                  deleteFetchFunc={deleteOrder}
                  onSuccessfulDelete={onOrderDelete}
                  clearSearchValue={clearSearchValue}
                />
              </td>
            </tr>
            <tr>
              {/* Order Items are displayed in a collapsable accordion */}
              <td></td>
              <td colSpan={5}>
                <Accordion>
                  <Accordion.Item eventKey={0}>
                    <Accordion.Header>Order Items</Accordion.Header>
                    <Accordion.Body>
                      <Table striped bordered hover>
                        <thead>
                          <tr className="text-center bold-italic-text">
                            <td>#</td>
                            <td>Product</td>
                            <td>Quantity</td>
                            <td>Status</td>
                            <td>Details</td>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <React.Fragment key={index}>
                              <tr className="text-center italic-text">
                                <td>{index + 1}</td>
                                <td key={index}>
                                  <ProductDetailModal
                                    productId={item.product.id}
                                  />
                                </td>
                                <td>{item.quantity}</td>
                                <td>{item.status}</td>
                                <td>{item.issue_detail}</td>
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
export default OrderTable;
