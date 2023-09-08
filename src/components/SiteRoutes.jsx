import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import AccountPage from "../pages/AccountPage";
import SupplierCataloguePage from "../pages/SupplierCataloguePage";
import InventoryPage from "../pages/InventoryPage";
import ShopPage from "../pages/ShopPage";
import SuppliersPage from "../pages/SuppliersPage";
import ManufacturersPage from "../pages/ManufacturersPage";
import OrdersPage from "../pages/OrdersPage";
import QuotesPage from "../pages/QuotesPage";
import ProductDetailComponent from "./ProductDetailComponent";
import ManufacturerDetailComponent from "./ManufacturerDetailComponent";
import SupplierDetailComponent from "./SupplierDetailsComponent";
import QuoteDetailComponent from "./QuoteDetailComponent";
import OrderDetailsComponent from "./OrderDetailsComponent";

const SiteRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/supplier_catalogue" element={<SupplierCataloguePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/manufacturers" element={<ManufacturersPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route
          path="/product-details/:id"
          element={<ProductDetailComponent />}
        />
        <Route
          path="/manufacturer-details/:id"
          element={<ManufacturerDetailComponent />}
        />
        <Route
          path="/supplier-details/:id"
          element={<SupplierDetailComponent />}
        />
        <Route path="/quote-details/:id" element={<QuoteDetailComponent />} />
        <Route path="/order-details/:id" element={<OrderDetailsComponent />} />
      </Routes>
    </div>
  );
};
export default SiteRoutes;
