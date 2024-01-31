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
import NotificationsPage from "../../pages/Notifications/NotificationsPage";

/**
 * SiteRoutes Component

 * This component defines the routes (page URLs) for the application, and determines the page component to be rendered for
 * each route. If a user is not authorized to access a certain route, they are redirected to the NotAuthorizedPage.
 *
 * @component
 *
 * @example
 *
 * return (
 *   <SiteRoutes />
 * );
 */
const SiteRoutes = () => {
  // UseContext hook from react to get the isSupplier value from context
  const { isSupplier } = useContext(AppContext);

  return (
    <div>
      <Routes>
        {/*Each Route component defines a route URL and corresponding page*/}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route
          path="/supplier-catalogue"
          element={
            isSupplier ? <ProductList /> : <Navigate to="/not-authorized" />
          }
        />
        {/* If isSupplier, allow access to supplier-catalogue, else redirect */}
        <Route
          path="/inventory"
          element={
            !isSupplier ? <ProductList /> : <Navigate to="/not-authorized" />
          }
        />
        {/* Decisions about what to render for other routes also depend on isSupplier value */}
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
        />
        <Route
          path="/notifications"
          element={
            !isSupplier ? (
              <NotificationsPage />
            ) : (
              <Navigate to="/not-authorized" />
            )
          }
        />
        {/* This route will always render NotAuthorizedPage component */}
        <Route path="/not-authorized" element={<NotAuthorizedPage />} />
      </Routes>
    </div>
  );
};
export default SiteRoutes;
