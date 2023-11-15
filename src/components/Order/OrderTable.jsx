import React from "react";
import Table from "react-bootstrap/Table";
import DeleteButton from "../Generic/DeleteButton";
import OrderModal from "./OrderModal";
import { deleteOrder } from "../../clients/order_client";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const OrderTable = ({ orderList, handleEdit }) => {
  return (
    <Table striped bordered hover>
      <thead>
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
        {orderList.map((order, index) => (
          <React.Fragment key={index}>
            <tr key={index} className="text-center align-middle">
              <td>{index + 1}</td>
              <td>
                <a href={`/order-details/${order.id}`} className="link-">
                  {order.id}
                </a>
              </td>
              <td className="justify-content-around">
                <a href={`/quote-details/${order.quote.id}`} className="link-">
                  {order.quote.id}
                </a>
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
                <a
                  href={`/supplier-details/${order.supplier.id}`}
                  className="link-"
                >
                  {order.supplier.name}
                </a>
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
                  returnLocation="orders"
                />
              </td>
            </tr>
            <tr className="text-center bold-italic-text">
              <td></td>
              <td>#</td>
              <td>Product</td>
              <td>Quantity</td>
              <td>Batch</td>
              <td>Expiry</td>
              <td>Status</td>
              <td>Details</td>
            </tr>
            {order.items.map((item, index) => (
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
                  <td>{item.batch}</td>
                  <td>{item.expiry}</td>
                  <td>{item.status}</td>
                  <td>{item.issue_detail}</td>
                </tr>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </Table>
  );
};
export default OrderTable;
