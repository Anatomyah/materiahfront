import React from "react";
import Card from "react-bootstrap/Card";

const NotificationCard = ({ props }) => {
  return (
    <Card style={{ width: "18rem" }} className="mb-2">
      <Card.Body>
        <Card.Title>{props.catNum}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {props.productName}
        </Card.Subtitle>
        <Card.Text>
          <p>Supplier: {props.supplierName}</p>
          <p>Current stock: {props.currentStock}</p>
          <p>Last ordered: {props.lastOrdered}</p>
          {props.avgOrderTime && <p>Order interval: {props.avgOrderTime}</p>}
        </Card.Text>
        {/*<Card.Link href="#">Card Link</Card.Link>*/}
      </Card.Body>
    </Card>
  );
};
export default NotificationCard;
