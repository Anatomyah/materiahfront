import React from "react";
import Table from "react-bootstrap/Table";
import DeleteButton from "../Generic/DeleteButton";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import ProductDetailModal from "../Product/ProductDetailModal";
import OrderDetailModal from "../Order/OrderDetailModal";
import { formatTimeTillExpiry } from "../../config_and_helpers/helpers";
import {
  deleteExpiryNotification,
  deleteOrderNotification,
} from "../../clients/notifications_client";
/**
 * Renders a notifications table.
 *
 * @param {object} props - The component props.
 * @param {array} props.notificationsList - The list of notifications.
 * @param {function} props.handleEdit - The function to handle edit actions.
 * @param {string} props.activeTab - The active tab of the table.
 * @returns {JSX.Element} - The table component.
 */
const NotificationsTable = ({ notificationsList, handleEdit, activeTab }) => {
  return (
    <>
      {activeTab === "order" ? (
        <Table striped bordered hover>
          {/*Table header*/}
          <thead>
            <tr className="text-center">
              <th>#</th>
              <th>Supplier</th>
              <th>Product</th>
              <th>Last Ordered</th>
              <th>Average Order Interval</th>
              <th>Current Stock</th>
              <th>Average Order Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody>
            {notificationsList.map((notification, index) => (
              // Table row for each notification
              <tr key={notification.id} className="text-center align-middle">
                {/* Display order number of notification*/}
                <td>{index + 1}</td>
                {/* Display name of notification*/}
                <td>
                  {/* Clicking on the name opens the supplier detail modal*/}
                  <SupplierDetailModal
                    supplierId={notification.product.supplier.id}
                  />
                </td>
                {/* Clicking on the name opens the product detail modal*/}
                <td>
                  <ProductDetailModal productId={notification.product.id} />
                </td>
                <td>{notification.product.last_ordered}</td>
                <td>{notification.product.avg_order_time}</td>
                <td>{notification.product.current_stock}</td>
                <td>{notification.product.avg_order_quantity}</td>
                {/*Display actions: Delete*/}
                <td className="d-flex flex-row align-items-center justify-content-evenly">
                  {/* Delete notification */}
                  <DeleteButton
                    objectType="order notification"
                    objectName={notification.id}
                    objectId={notification.id}
                    deleteFetchFunc={deleteOrderNotification}
                    onSuccessfulDelete={handleEdit}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Table striped bordered hover>
          {/*Table header*/}
          <thead>
            <tr className="text-center">
              <th>#</th>
              <th>Supplier</th>
              <th>Product</th>
              <th>Item ID</th>
              <th>Item Batch</th>
              <th>Item Expiry</th>
              <th>Time Till Expiration</th>
              <th>Order</th>
              <th>Received On</th>
              <th>Actions</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody>
            {notificationsList.map((notification, index) => (
              // Table row for each notification
              <tr key={notification.id} className="text-center align-middle">
                {/* Display order number of notification*/}
                <td>{index + 1}</td>
                {/* Display name of notification*/}
                <td>
                  {/* Clicking on the name opens the supplier detail modal*/}
                  <SupplierDetailModal
                    supplierId={notification.product_item.product.supplier}
                  />
                </td>
                {/* Clicking on the name opens the product detail modal*/}
                <td>
                  <ProductDetailModal
                    productId={notification.product_item.product.id}
                  />
                </td>
                <td>{notification.product_item.id}</td>
                <td>{notification.product_item.batch}</td>
                <td>{notification.product_item.expiry}</td>
                <td style={{ backgroundColor: "#f84f4f", color: "white" }}>
                  {formatTimeTillExpiry(notification.product_item.expiry)}
                </td>
                {/* Clicking on the name opens the order detail modal*/}
                <td>
                  {notification?.order ? (
                    <OrderDetailModal
                      orderId={notification.product_item.order.id}
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>{notification.product_item?.order.received || "N/A"}</td>

                {/*Display actions: Delete*/}
                <td className="d-flex flex-row align-items-center justify-content-evenly">
                  {/* Delete notification */}
                  <DeleteButton
                    objectType="expiry notification"
                    objectName={notification.id}
                    objectId={notification.id}
                    deleteFetchFunc={deleteExpiryNotification}
                    onSuccessfulDelete={handleEdit}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default NotificationsTable;
