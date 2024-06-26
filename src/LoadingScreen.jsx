import React from "react";
import { Spinner } from "react-bootstrap";
import "./AppStyles.css";
/**
 * Represents a loading screen component.
 *
 * @return {JSX.Element} The loading screen component.
 */
const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <Spinner animation="border" role="status" variant={"primary"}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default LoadingScreen;
