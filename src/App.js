import React, { createContext, useState } from "react";
import Login from "./pages/Login";
import TopNavBar from "./components/TopNavbar";
import SiteRoutes from "./components/SiteRoutes";
import { ToastContainer } from "react-toastify";

export const AppContext = createContext(null);

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [token, setToken] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [isSupplier, setIsSupplier] = useState(false);

  return (
    <>
      <ToastContainer />
      <AppContext.Provider
        value={{
          isLogged,
          setIsLogged,
          token,
          setToken,
          userDetails,
          setUserDetails,
          isSupplier,
          setIsSupplier,
        }}
      >
        {isLogged ? (
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
