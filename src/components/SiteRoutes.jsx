import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/User/LoginPage";
import HomePage from "../pages/HomePage";
import AccountPage from "../pages/User/AccountPage";
import SupplierCataloguePage from "../pages/Supplier/SupplierCataloguePage";
import ProductList from "../pages/Product/ProductList";
import ShopPage from "../pages/Shop/ShopPage";
import SuppliersPage from "../pages/Supplier/SuppliersPage";
import ManufacturersPage from "../pages/Manufacturer/ManufacturersPage";
import OrdersPage from "../pages/Order/OrdersPage";
import QuotesPage from "../pages/Quote/QuotesPage";
import ProductDetailComponent from "./Product/ProductDetailComponent";
import ManufacturerDetailComponent from "./Manufacturer/ManufacturerDetailComponent";
import SupplierDetailComponent from "./Supplier/SupplierDetailsComponent";
import QuoteDetailComponent from "./Quote/QuoteDetailComponent";
import OrderDetailsComponent from "./Order/OrderDetailsComponent";
import ShoppingCart from "./Shop/ShoppingCart";

const SiteRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/supplier-catalogue" element={<SupplierCataloguePage />} />
        <Route path="/inventory" element={<ProductList />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shopping-cart" element={<ShoppingCart />} />
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
