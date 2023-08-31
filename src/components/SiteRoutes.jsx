import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import HomePage from "../pages/HomePage";
import Account from "../pages/Account";

const SiteRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
};
export default SiteRoutes;
