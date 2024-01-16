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
import BottomNavBar from "./components/Navigation/BottomNavBar";

// General App context responsible for user related states
export const AppContext = createContext(null);

// Cart context responsible for the shopping cart states
export const CartAppContext = createContext(null);

// Order context responsible for updating states if an order is deleted
export const OrderDeletionContext = createContext();
/**
 * This is the root component of the application.
 * The entire app state is maintained here including token, user details, supplier status, notification settings, cart status and cart content.
 * It consists of hooks for initialising the app, handling session storage and managing the shopping cart.
 * The component also boasts context providers for sharing app-wide state like authentication token, user details, cart status and cart content among other child components.
 * Depending on the token status, it conditionally renders the main site routes or the login page.
 *
 * @component
 *
 * @returns {JSX.Element} Returns the JSX for the Entire App's DOM hierarchy.
 */
function App() {
  // State hooks
  const [isLoading, setIsLoading] = useState(true); // Indicates whether the user's details are being loaded at startup
  const [token, setToken] = useState(null); // Token for the current user's session
  const [userDetails, setUserDetails] = useState({}); // Details about the currently authenticated user
  const [isSupplier, setIsSupplier] = useState(false); // Flag indicating whether the current user is a supplier
  const [rememberMe, setRememberMe] = useState(false); // Flag for remembering the user's session
  const [notifications, setNotifications] = useState([]); // List of current notifications
  const [showCart, setShowCart] = useState(false); // Flag for showing the cart modal
  const [cart, setCart] = useState([]); // List of items in the cart
  const [cartCount, setCartCount] = useState(0); // Number of items in the cart
  const [isOrderDeleted, setIsOrderDeleted] = useState(false); // Is an order deleted

  // Function for toggling the is order deleted state
  const toggleOrderDeleted = () => {
    setIsOrderDeleted((prevState) => !prevState);
  };

  // useEffect hook for initialization
  useEffect(() => {
    (async () => {
      // Initialize application state with data from local/session storage
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

  // useEffect hook for local/session storage
  useEffect(() => {
    let storageType = rememberMe ? "localStorage" : "sessionStorage";
    // Create a handler for the 'beforeunload' event
    const handleBeforeUnload = createBeforeUnloadHandler(
      storageType,
      token,
      userDetails,
      notifications,
      isSupplier,
      rememberMe,
      cart,
    );

    // Add the event listener for 'beforeunload'
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [token, userDetails, notifications, isSupplier, rememberMe, cart]);

  // useEffect hook for cart
  useEffect(() => {
    // Update cartCount whenever cart changes
    setCartCount(cart?.length);
    // Store the cart in localStorage (this storage won't be cleared even if the browser is closed)
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Render a loading screen while the app is initializing
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render the core application components
  return (
    <div>
      {/* This is the ToastContainer react-toastify uses to display toast notifications. */}
      <ToastContainer />

      {/* AppContext is a context for application-wide state. */}
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
        {/* CartAppContext is a context for the shopping cart-related state. */}
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
          {/* Order deletion context provider for enabling follow-up actions to an order deletion */}
          <OrderDeletionContext.Provider
            value={{ isOrderDeleted, toggleOrderDeleted }}
          >
            {token ? (
              <>
                {/* The TopNavBar, SiteRoutes and CartModal are only rendered when the user has a valid token (i.e., they are authenticated). */}
                <TopNavBar />
                <SiteRoutes />
                <CartModal show={showCart} setShow={setShowCart} />
              </>
            ) : (
              <>
                {/* The LoginPage and BottomNavBar are rendered when the user is not authenticated (i.e., they do not have a valid token). */}
                <LoginPage />
                <BottomNavBar />
              </>
            )}
          </OrderDeletionContext.Provider>
        </CartAppContext.Provider>
      </AppContext.Provider>
    </div>
  );
}

export default App;
