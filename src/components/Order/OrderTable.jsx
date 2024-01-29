import React, { useContext } from "react";
import Table from "react-bootstrap/Table";
import DeleteButton from "../Generic/DeleteButton";
import OrderModal from "./OrderModal";
import { deleteOrder } from "../../clients/order_client";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import QuoteDetailModal from "../Quote/QuoteDetailModal";
import OrderDetailModal from "./OrderDetailModal";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import { Accordion } from "react-bootstrap";
import ProductDetailModal from "../Product/ProductDetailModal";
import { OrderDeletionContext } from "../../App";

/**
 * OrderTable Component
 *
 * This component displays a list of orders in a tabular format. Each order is rendered as a row in the table.
 * The table includes various details for each order such as order quote, arrival time, received by, receipts, supplier, and status.
 * Actions that can update the order can also be done here like edit and delete.
 *
 * @component
 * @param {Array} orderList - A list of order objects to be displayed as rows in the table.
 * @param {function} handleEdit - A function that tell parent component to refresh the order data.
 */
const OrderTable = ({ orderList, handleEdit }) => {
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
          <th>Quote</th>
          <th>Arrival</th>
          <th>Received By</th>
          <th>Receipts</th>
          <th>Supplier</th>
          <th>Status</th>
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
              <td className="justify-content-around">
                <QuoteDetailModal quoteId={order.quote.id} />
                <span> | </span>
                <a href={order.quote.quote_url} className="link-">
                  <PictureAsPdfIcon />
                </a>
              </td>
              <td>{order.arrival_date}</td>
              <td>{order.received_by}</td>
              <td className="justify-content-center d-flex flex-row">
                {order.images.map((image, index) => (
                  <div key={index}>
                    <a key={index} href={image.image_url}>
                      <AttachFileIcon />
                    </a>
                    {index !== order.images.length - 1 && <span>| </span>}
                  </div>
                ))}
              </td>
              <td>
                <SupplierDetailModal supplierId={order.supplier.id} />
              </td>
              <td>{order.quote.status}</td>
              <td className="d-flex flex-row justify-content-center">
                <div className="me-2">
                  <OrderModal
                    orderObj={order}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>
                <DeleteButton
                  objectType="order"
                  objectName={order.id}
                  objectId={order.id}
                  deleteFetchFunc={deleteOrder}
                  onSuccessfulDelete={onOrderDelete}
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
