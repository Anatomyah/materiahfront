import React, { useState } from "react";
import Nav from "react-bootstrap/Nav";
import ProductList from "../Product/ProductList";

/**
 * ShopPage is a React functional component that renders a shop interface
 * with two tabs: "Lab Catalogue" and "Supplier Catalogue". The component
 * allows users to switch between these two tabs to view different sets of products.
 * It maintains the state of the currently active tab and conditionally renders
 * the ProductList component based on the selected tab.
 *
 * @returns {JSX.Element} The ShopPage component.
 */
const ShopPage = () => {
  // useState hook to manage the active tab state
  const [activeTab, setActiveTab] = useState("lab");

  return (
    <div>
      {/* Navigation bar for switching between different catalogues */}
      <Nav fill variant="tabs" defaultActiveKey="lab">
        {/* Navigation item for the Lab Catalogue */}
        <Nav.Item>
          <Nav.Link eventKey="lab" onClick={() => setActiveTab("lab")}>
            Lab Catalogue
          </Nav.Link>
          {/* On click, sets activeTab to "lab" */}
        </Nav.Item>

        {/* Navigation item for the Supplier Catalogue */}
        <Nav.Item>
          <Nav.Link
            eventKey="supplier"
            onClick={() => setActiveTab("supplier")}
          >
            Supplier Catalogue
          </Nav.Link>
          {/* On click, sets activeTab to "supplier" */}
        </Nav.Item>
      </Nav>

      {/* Conditional rendering based on the active tab */}
      {activeTab === "lab" ? (
        <ProductList key="lab" isShopView={true} />
      ) : (
        // Renders ProductList for the "lab" catalogue
        <ProductList key="supplier" isShopView={true} isCatalogueView={true} />
        // Renders ProductList for the "supplier" catalogue with additional props
      )}
    </div>
  );
};
export default ShopPage;
