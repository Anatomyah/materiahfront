import React, { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/User/LoginPage";
import TopNavBar from "./components/Navigation/TopNavbar";
import SiteRoutes from "./components/Navigation/SiteRoutes";
import { ToastContainer } from "react-toastify";
import {
  createBeforeUnloadHandler,
  initializeApp,
} from "./config_and_helpers/helpers";

export const AppContext = createContext(null);
export const CartAppContext = createContext(null);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [isSupplier, setIsSupplier] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState();

  useEffect(() => {
    (async () => {
      await initializeApp(
        setRememberMe,
        setToken,
        setUserDetails,
        setNotifications,
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
      notifications,
      isSupplier,
      rememberMe,
    );

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [token, userDetails, notifications, isSupplier, rememberMe]);

  useEffect(() => {
    if (cart.length === 0) {
      const storedCart = localStorage.getItem("cart");
      if (storedCart && storedCart !== "null") {
        setCart(JSON.parse(storedCart));
      }
    }
  }, []);

  useEffect(() => {
    setCartCount(cart.length);
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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
          notifications,
          setNotifications,
        }}
      >
        <CartAppContext.Provider
          value={{ cart, setCart, cartCount, setCartCount }}
        >
          {token ? (
            <>
              <TopNavBar />
              <SiteRoutes />
            </>
          ) : (
            <LoginPage />
          )}
        </CartAppContext.Provider>
      </AppContext.Provider>
    </>
  );
}

export default App;
