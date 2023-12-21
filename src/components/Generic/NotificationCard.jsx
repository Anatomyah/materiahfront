import React from "react";
import Card from "react-bootstrap/Card";

/**
 * The `NotificationCard` component is a reusable component which displays notification information as a bootstrap `Card`.
 *
 * The component expects a `props` object that should include a `catNum`, `productName`, `supplierName`, `currentStock`, `lastOrdered`, and optionally `avgOrderTime`.
 * All the props are used to display various information on the card.
 *
 * @component
 *
 * @prop {object} props - The properties to be displayed on the card. It should include:
 * - `catNum`: string | number
 * - `productName`: string
 * - `supplierName`: string
 * - `currentStock`: string | number
 * - `lastOrdered`: string | number | Date
 * - `avgOrderTime` (optional): string | number
 *
 * @example
 * const props = {
 *   catNum: 'CAT123',
 *   productName: 'My Cool Product',
 *   supplierName: 'Supplier Inc.',
 *   currentStock: 20,
 *   lastOrdered: '2022-01-01',
 *   avgOrderTime: '2 weeks'
 * };
 *
 * return (
 *   <NotificationCard props={props} />
 * );
 *
 * @returns {React.Node} - The NotificationCard component
 */
const NotificationCard = ({ props }) => {
  return (
    <Card style={{ width: "18rem" }} className="mb-2">
      <Card.Body>
        {/* Display category number*/}
        <Card.Title>{props.catNum}</Card.Title>
        {/*Display product name*/}
        <Card.Subtitle className="mb-2 text-muted">
          {props.productName}
        </Card.Subtitle>
        <Card.Text>
          {/*Display supplier name*/}
          <p>Supplier: {props.supplierName}</p>
          {/*Display current stock*/}
          <p>Current stock: {props.currentStock}</p>
          {/*Display last ordered date*/}
          <p>Last ordered: {props.lastOrdered}</p>
          {/*Optionally display average order time, if it exists*/}
          {props.avgOrderTime && <p>Order interval: {props.avgOrderTime}</p>}
        </Card.Text>
        {/*<Card.Link href="#">Card Link</Card.Link>*/}
      </Card.Body>
    </Card>
  );
};
export default NotificationCard;
