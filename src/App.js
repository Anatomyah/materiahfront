import React, { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/User/LoginPage";
import TopNavBar from "./components/Header/TopNavbar";
import SiteRoutes from "./components/SiteRoutes";
import { ToastContainer } from "react-toastify";
import {
  createBeforeUnloadHandler,
  initializeApp,
} from "./config_and_helpers/helpers";

export const AppContext = createContext(null);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [isSupplier, setIsSupplier] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    (async () => {
      await initializeApp(
        setRememberMe,
        setToken,
        setUserDetails,
        setIsSupplier,
        setIsLoading,
      );
    })();
  }, []);

  useEffect(() => {
    let storageType = rememberMe ? "localStorage" : "sessionStorage";
    const handleBeforeUnload = createBeforeUnloadHandler(
      storageType,
      token,
      userDetails,
      isSupplier,
      rememberMe,
    );

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
