import React, { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/User/LoginPage";
import TopNavBar from "./components/Navigation/TopNavbar";
import SiteRoutes from "./components/Navigation/SiteRoutes";
import { ToastContainer } from "react-toastify";
import {
  createBeforeUnloadHandler,
  initializeApp,
} from "./config_and_helpers/helpers";
import CartModal from "./components/Shop/CartModal";

export const AppContext = createContext(null);
export const CartAppContext = createContext(null);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [isSupplier, setIsSupplier] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showCart, setShowCart] = useState(false);
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
        setCart,
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
      cart,
    );

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [token, userDetails, notifications, isSupplier, rememberMe, cart]);

  useEffect(() => {
    setCartCount(cart?.length);
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
          value={{
            showCart,
            setShowCart,
            cart,
            setCart,
            cartCount,
            setCartCount,
          }}
        >
          {token ? (
            <>
              <TopNavBar />
              <SiteRoutes />
              <CartModal show={showCart} setShow={setShowCart} />
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
