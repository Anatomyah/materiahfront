import React, { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/User/LoginPage";
import TopNavBar from "./components/Header/TopNavbar";
import SiteRoutes from "./components/SiteRoutes";
import { ToastContainer } from "react-toastify";
import { validateToken } from "./clients/user_client";

export const AppContext = createContext(null);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [isSupplier, setIsSupplier] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadFromLocalStorage = async () => {
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
    };

    loadFromLocalStorage().then(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const validateExistingToken = async () => {
      if (token) {
        const response = await validateToken(token);
        if (response && !response.success) {
          setToken(null);
          alert("Your session has expired. Please log in again.");
        }
      }
    };

    if (!isLoading) {
      validateExistingToken();
    }
  }, [token, isLoading]);

  // This useEffect runs for handling beforeunload event
  useEffect(() => {
    const handleBeforeUnload = async () => {
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
