import React, { createContext, useEffect, useState } from "react";
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

  useEffect(() => {
    const savedIsLogged = localStorage.getItem("isLogged");
    const savedToken = localStorage.getItem("token");
    const savedUserDetails = localStorage.getItem("userDetails");
    const savedIsSupplier = localStorage.getItem("isSupplier");

    if (savedIsLogged !== null) setIsLogged(savedIsLogged === "true");
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
      localStorage.setItem("isLogged", String(isLogged));
      localStorage.setItem("token", token);
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
      localStorage.setItem("isSupplier", String(isSupplier));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLogged, token, userDetails, isSupplier]);
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
