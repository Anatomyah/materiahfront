import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../../pages/User/LoginPage";
import HomePage from "../../pages/HomePage";
import AccountPage from "../../pages/User/AccountPage";
import SupplierCataloguePage from "../../pages/Supplier/SupplierCataloguePage";
import ProductList from "../../pages/Product/ProductList";
import ShopPage from "../../pages/Shop/ShopPage";
import SuppliersPage from "../../pages/Supplier/SuppliersPage";
import ManufacturersPage from "../../pages/Manufacturer/ManufacturersPage";
import OrdersPage from "../../pages/Order/OrdersPage";
import QuotesPage from "../../pages/Quote/QuotesPage";
import ProductDetailComponent from "../Product/ProductDetailComponent";
import ManufacturerDetailComponent from "../Manufacturer/ManufacturerDetailComponent";
import SupplierDetailComponent from "../Supplier/SupplierDetailsComponent";
import QuoteDetailComponent from "../Quote/QuoteDetailComponent";
import OrderDetailsComponent from "../Order/OrderDetailsComponent";
import ShoppingCart from "../Shop/ShoppingCart";
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
            isSupplier ? (
              <SupplierCataloguePage />
            ) : (
              <Navigate to="/not-authorized" />
            )
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
          path="/shopping-cart"
          element={
            !isSupplier ? <ShoppingCart /> : <Navigate to="/not-authorized" />
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
        <Route
          path="/product-details/:id"
          element={
            !isSupplier ? (
              <ProductDetailComponent />
            ) : (
              <Navigate to="/not-authorized" />
            )
          }
        />
        <Route
          path="/manufacturer-details/:id"
          element={
            !isSupplier ? (
              <ManufacturerDetailComponent />
            ) : (
              <Navigate to="/not-authorized" />
            )
          }
        />
        <Route
          path="/supplier-details/:id"
          element={
            !isSupplier ? (
              <SupplierDetailComponent />
            ) : (
              <Navigate to="/not-authorized" />
            )
          }
        />
        <Route
          path="/quote-details/:id"
          element={
            !isSupplier ? (
              <QuoteDetailComponent />
            ) : (
              <Navigate to="/not-authorized" />
            )
          }
        />
        <Route
          path="/order-details/:id"
          element={
            !isSupplier ? (
              <OrderDetailsComponent />
            ) : (
              <Navigate to="/not-authorized" />
            )
          }
        />
        <Route path="/not-authorized" element={<NotAuthorizedPage />} />
      </Routes>
    </div>
  );
};
export default SiteRoutes;
