import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../../pages/User/LoginPage";
import HomePage from "../../pages/Home/HomePage";
import AccountPage from "../../pages/User/AccountPage";
import ProductList from "../../pages/Product/ProductList";
import ShopPage from "../../pages/Shop/ShopPage";
import SuppliersPage from "../../pages/Supplier/SuppliersPage";
import ManufacturersPage from "../../pages/Manufacturer/ManufacturersPage";
import OrdersPage from "../../pages/Order/OrdersPage";
import QuotesPage from "../../pages/Quote/QuotesPage";
import NotAuthorizedPage from "./NotAuthorizedPage";
import { AppContext } from "../../App";

const SiteRoutes = () => {
  const { isSupplier } = useContext(AppContext);

  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route
          path="/supplier-catalogue"
          element={
            isSupplier ? <ProductList /> : <Navigate to="/not-authorized" />
          }
        />
        <Route
          path="/inventory"
          element={
            !isSupplier ? <ProductList /> : <Navigate to="/not-authorized" />
          }
        />
        <Route
          path="/shop"
          element={
            !isSupplier ? <ShopPage /> : <Navigate to="/not-authorized" />
          }
        />
        <Route
          path="/orders"
          element={
            !isSupplier ? <OrdersPage /> : <Navigate to="/not-authorized" />
          }
        />
        <Route
          path="/suppliers"
          element={
            !isSupplier ? <SuppliersPage /> : <Navigate to="/not-authorized" />
          }
        />
        <Route
          path="/manufacturers"
          element={
            !isSupplier ? (
              <ManufacturersPage />
            ) : (
              <Navigate to="/not-authorized" />
            )
          }
        />
        <Route
          path="/quotes"
          element={
            !isSupplier ? <QuotesPage /> : <Navigate to="/not-authorized" />
          }
        />
        <Route path="/not-authorized" element={<NotAuthorizedPage />} />
      </Routes>
    </div>
  );
};
export default SiteRoutes;
