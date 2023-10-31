import React from "react";
import { VisibilityOffTwoTone, VisibilityTwoTone } from "@mui/icons-material";

const ShowPassword = ({ showPassword, setShowPassword }) => {
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div>
      {showPassword ? (
        <VisibilityOffTwoTone
          onClick={togglePassword}
          style={{ cursor: "pointer" }}
        />
      ) : (
        <VisibilityTwoTone
          onClick={togglePassword}
          style={{ cursor: "pointer" }}
        />
      )}
    </div>
  );
};
export default ShowPassword;
