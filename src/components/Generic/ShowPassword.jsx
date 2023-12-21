import React from "react";
import { VisibilityOffTwoTone, VisibilityTwoTone } from "@mui/icons-material";

/**
 * A ShowPassword component using Material-UI Icons. It toggles the visibility of the password on click.
 *
 * The ShowPassword component takes two props, `showPassword` and `setShowPassword`.
 * `showPassword` is a boolean stating whether the password is currently visible or not.
 * `setShowPassword` is a function that toggles the visibility of the password.
 *
 * @component
 *
 * @prop {Boolean} showPassword - State variable indicating whether the password is visible or not.
 * @prop {Function} setShowPassword - Function to toggle the visibility of the password.
 *
 * @example
 *
 * let showPassword = false;
 * const setShowPassword = () => {
 *   showPassword = !showPassword;
 * }
 *
 * return (
 *   <ShowPassword showPassword={showPassword} setShowPassword={setShowPassword}/>
 * );
 *
 */
const ShowPassword = ({ showPassword, setShowPassword }) => {
  // Event handler for toggling the visibility of the password
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div>
      {/* If password is visible, render the VisibilityOffTwoTone icon.
          Otherwise, render the VisibilityTwoTone icon.
          On icon click, toggle the visibility of the password.*/}
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
