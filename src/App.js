import React, { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import TopNavBar from "./components/TopNavbar";
import SiteRoutes from "./components/SiteRoutes";
import { ToastContainer } from "react-toastify";

export const AppContext = createContext(null);

function App() {
  const [token, setToken] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [isSupplier, setIsSupplier] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserDetails = localStorage.getItem("userDetails");
    const savedIsSupplier = localStorage.getItem("isSupplier");
    const savedRememberMe = localStorage.getItem("rememberMe");

    if (savedRememberMe === "true") {
      setRememberMe(true);
      if (savedToken !== null) setToken(savedToken);
      if (savedUserDetails !== null)
        setUserDetails(JSON.parse(savedUserDetails));
      if (savedIsSupplier !== null) setIsSupplier(savedIsSupplier === "true");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userDetails");
      localStorage.removeItem("isSupplier");
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
        localStorage.setItem("isSupplier", String(isSupplier));
        localStorage.setItem("rememberMe", String(rememberMe));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [token, userDetails, isSupplier, rememberMe]);
  return (
    <>
      <ToastContainer />
      <AppContext.Provider
        value={{
          token,
          setToken,
          rememberMe,
          setRememberMe,
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
          <LoginPage />
        )}
      </AppContext.Provider>
    </>
  );
}

export default App;
