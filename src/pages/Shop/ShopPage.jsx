import React, { useState } from "react";
import SupplierCatalogue from "../../components/Shop/SupplierCatalogue";
import Nav from "react-bootstrap/Nav";
import ProductList from "../Product/ProductList";

const ShopPage = () => {
  const [activeTab, setActiveTab] = useState("lab");

  return (
    <div>
      <Nav fill variant="tabs" defaultActiveKey="lab">
        <Nav.Item>
          <Nav.Link eventKey="lab" onClick={() => setActiveTab("lab")}>
            Lab Catalogue
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="supplier"
            onClick={() => setActiveTab("supplier")}
          >
            Supplier Catalogue
          </Nav.Link>
        </Nav.Item>
      </Nav>
      {activeTab === "lab" ? (
        <ProductList isShopView={true} />
      ) : (
        <SupplierCatalogue />
      )}
    </div>
  );
};
export default ShopPage;
