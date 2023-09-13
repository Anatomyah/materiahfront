import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../clients/user_client";
import { AppContext } from "../../App";
import SignupModal from "../../components/User/SignupModal";
import ResetPasswordModal from "../../components/User/ResetPasswordModal";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const nav = useNavigate();
  const {
    token,
    setToken,
    rememberMe,
    setRememberMe,
    setUserDetails,
    setIsSupplier,
  } = useContext(AppContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ username, password }, setToken, setUserDetails, setIsSupplier).then(
      (response) => {
        if (response && response.success) {
          setLoginError(false);
          console.log(token);
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
        <legend>LoginPage</legend>
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
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember Me
        </label>
        {loginError && <p>Unable to log in with provided credentials</p>}
        <input type="submit" value="Login" disabled={!password || !username} />
      </form>
      <SignupModal />
      <ResetPasswordModal />
    </div>
  );
};
export default LoginPage;
