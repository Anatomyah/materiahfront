import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../client";
import { AppContext } from "../App";
import SignupModal from "../components/SignupModal";
import ResetPasswordModal from "../components/ResetPasswordModal";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const nav = useNavigate();
  const { setIsLogged, setToken, setUserDetails, setIsSupplier } =
    useContext(AppContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ username, password }, setToken, setUserDetails, setIsSupplier).then(
      (res) => {
        if (res) {
          setLoginError(false);
          setIsLogged(true);
          nav("/");
        } else {
          setLoginError(true);
        }
      },
    );
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <legend>Login</legend>
        <input
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Username"
          value={username}
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          value={password}
          required
        />
        {loginError && <p>Unable to log in with provided credentials</p>}
        <input type="submit" value="Login" disabled={!password || !username} />
      </form>
      <SignupModal />
      <ResetPasswordModal />
    </div>
  );
};
export default Login;
