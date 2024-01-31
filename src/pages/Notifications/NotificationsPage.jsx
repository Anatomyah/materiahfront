import React, { useState } from "react";
import Nav from "react-bootstrap/Nav";
import NotificationsList from "../../components/Notifications/NotificationsList";

/**
 * Represents the Notifications page component.
 *
 * @returns {JSX.Element} The Notifications page component.
 */
const NotificationsPage = () => {
  // useState hook to manage the active tab state
  const [activeTab, setActiveTab] = useState("order");

  return (
    <div>
      {/* Navigation bar for switching between different notifications */}
      <Nav fill variant="tabs" defaultActiveKey="order">
        {/* Navigation item for the order notifications */}
        <Nav.Item>
          <Nav.Link eventKey="order" onClick={() => setActiveTab("order")}>
            Order Notifications
          </Nav.Link>
          {/* On click, sets activeTab to "order" */}
        </Nav.Item>

        {/* Navigation item for the expiry notifications */}
        <Nav.Item>
          <Nav.Link eventKey="expiry" onClick={() => setActiveTab("expiry")}>
            Expiry Notifications
          </Nav.Link>
          {/* On click, sets activeTab to "expiry" */}
        </Nav.Item>
      </Nav>

      {/* Conditional rendering based on the active tab */}
      {activeTab === "order" ? (
        // Renders the NotificationsList component for the order notifications
        <NotificationsList key="order" activeTab="order" />
      ) : (
        // Renders the NotificationsList component for the order notifications
        <NotificationsList key="expiry" activeTab="expiry" />
      )}
    </div>
  );
};
export default NotificationsPage;
