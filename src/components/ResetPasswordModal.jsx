import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { getPasswordToken, resetPassword } from "../client";
import button from "bootstrap/js/src/button";

const ChangePasswordModal = ({}) => {
  const [email, setEmail] = useState();
  const [tokenSent, setTokenSent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const [isFilled, setIsFilled] = useState(true);

  useEffect(() => {
    setIsFilled(token && password);
  }, [token, password]);

  const handleClose = () => {
    setShowModal(false);
  };
  const handleShow = () => {
    setShowModal(true);
  };

  const handleTokenSent = () => {
    const emailInput = document.getElementById("email");
    if (!emailInput.checkValidity()) {
      setErrorMessages((prevState) => [
        ...prevState,
        "Email entered not found in our database",
      ]);
    }
    const res = getPasswordToken(email);
    if (res instanceof Error) {
      setErrorMessages((prevState) => [...prevState, res.message]);
    }
    setTokenSent(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = resetPassword(token, password);
    if (res instanceof Error) {
      setErrorMessages((prevState) => [...prevState, res.message]);
    }
    handleClose();
  };

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Forgot your password?
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!tokenSent ? (
            <>
              <p>
                Please enter your email address below. Once we've identified
                your address a token will be sent to your address
              </p>
              <input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter Email"
                value={email}
              />
              <button onClick={handleTokenSent}>Send Token</button>
            </>
          ) : (
            <>
              <p>
                An email was sent to your email address, containing a token.
                Enter the token below along with your new password.
              </p>
              <form className="form-control">
                <input
                  id="token"
                  onChange={(e) => setToken(e.target.value)}
                  type="text"
                  placeholder="Enter Token"
                  value={token}
                />
                <input
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter New Password"
                  value={password}
                />
                {errorMessages && (
                  <ul>
                    {errorMessages.map((error, id) => (
                      <li key={id} className="text-danger fw-bold">
                        {error}
                      </li>
                    ))}
                  </ul>
                )}
              </form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {tokenSent && (
            <Button
              variant="primary"
              disabled={!isFilled}
              onClick={(e) => {
                handleSubmit(e);
              }}
            >
              Update Password
            </Button>
          )}
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChangePasswordModal;
