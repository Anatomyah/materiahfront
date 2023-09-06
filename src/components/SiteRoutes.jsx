import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import Account from "../pages/Account";
import SupplierCataloguePage from "../pages/SupplierCataloguePage";
import InventoryPage from "../pages/InventoryPage";
import ShopPage from "../pages/ShopPage";
import OrdersPge from "../pages/OrdersPge";
import SuppliersPage from "../pages/SuppliersPage";
import ManufacturersPage from "../pages/ManufacturersPage";

const SiteRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/supplier_catalogue" element={<SupplierCataloguePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/orders" element={<OrdersPge />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/manufacturers" element={<ManufacturersPage />} />
      </Routes>
    </div>
  );
};
export default SiteRoutes;
