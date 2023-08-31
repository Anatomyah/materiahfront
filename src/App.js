import React, { createContext, useState } from "react";
import Login from "./pages/Login";
import TopNavBar from "./components/TopNavbar";
import SiteRoutes from "./components/SiteRoutes";

export const AppContext = createContext(null);

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [token, setToken] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [userType, setUserType] = useState("regular");

  return (
    <>
      <AppContext.Provider
        value={{
          isLogged,
          setIsLogged,
          token,
          setToken,
          userDetails,
          setUserDetails,
          userType,
          setUserType,
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
