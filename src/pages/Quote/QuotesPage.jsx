import React, { useState } from "react";
import Nav from "react-bootstrap/Nav";
import QuotesList from "../../components/Quote/QuotesList";

/**
 * QuotesPage Component.
 *
 * A component that manages and displays two tabs of quotes: unfulfilled and fulfilled. The user can switch between these tabs
 * using the navigation bar. Based on the active tab, the respective list of quotes is rendered on the page.
 *
 * @module QuotesPage
 */

const QuotesPage = () => {
  // Manage the active tab to to toggle between fulfilled and unfulfilled quotes
  const [activeTab, setActiveTab] = useState("unfulfilled");

  return (
    <div>
      <Nav fill variant="tabs" defaultActiveKey="unfulfilled">
        <Nav.Item>
          {/* Initiate tab switch to 'unfulfilled' quotes when clicked */}
          <Nav.Link
            eventKey="unfulfilled"
            onClick={() => setActiveTab("unfulfilled")}
          >
            Unfulfilled Quotes
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          {/* Initiate tab switch to 'fulfilled' quotes when clicked */}
          <Nav.Link
            eventKey="fulfilled"
            onClick={() => setActiveTab("fulfilled")}
          >
            Fulfilled Quotes
          </Nav.Link>
        </Nav.Item>
      </Nav>
      {/* Render according to the activeTab state - 'unfulfilled' or 'fulfilled' */}
      {activeTab === "unfulfilled" ? (
        <QuotesList key="unfulfilled" activeTab="unfulfilled" />
      ) : (
        <QuotesList key="fulfilled" activeTab="fulfilled" />
      )}
    </div>
  );
};
export default QuotesPage;
