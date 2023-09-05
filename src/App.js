import React, { createContext, useEffect, useState } from "react";
import Login from "./pages/Login";
import TopNavBar from "./components/TopNavbar";
import SiteRoutes from "./components/SiteRoutes";
import { ToastContainer } from "react-toastify";

export const AppContext = createContext(null);

function App() {
  const [token, setToken] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [isSupplier, setIsSupplier] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserDetails = localStorage.getItem("userDetails");
    const savedIsSupplier = localStorage.getItem("isSupplier");

    if (savedToken !== null) setToken(savedToken);
    if (savedUserDetails !== null) setUserDetails(JSON.parse(savedUserDetails));
    if (savedIsSupplier !== null) setIsSupplier(savedIsSupplier === "true");

    localStorage.removeItem("isLogged");
    localStorage.removeItem("token");
    localStorage.removeItem("userDetails");
    localStorage.removeItem("isSupplier");
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("token", token);
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
      localStorage.setItem("isSupplier", String(isSupplier));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [token, userDetails, isSupplier]);
  return (
    <>
      <ToastContainer />
      <AppContext.Provider
        value={{
          token,
          setToken,
          userDetails,
          setUserDetails,
          isSupplier,
          setIsSupplier,
        }}
      >
        {token ? (
          <>
            <TopNavBar />
            <SiteRoutes />
          </>
        ) : (
          <Login />
        )}
      </AppContext.Provider>
    </>
  );
}

export default App;
