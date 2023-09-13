import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { getPasswordToken, resetPassword } from "../../clients/user_client";

const ChangePasswordModal = ({ email }) => {
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
    getPasswordToken(email).then((response) => {
      if (response && !response.success) {
        // setErrorMessages((prevState) => [...prevState, response]);
        //   todo - present email sending error - modal? toast? message?
      }
      if (response && response.success) {
        setShowModal(true);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    resetPassword(token, password).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Change Password
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change Your Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            An email was sent to your email address, containing a token. Enter
            the token below along with your new password.
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
          </form>
          {errorMessages.length > 0 && (
            <ul>
              {errorMessages.map((error, id) => (
                <li key={id} className="text-danger fw-bold">
                  {error}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            disabled={!isFilled}
            onClick={(e) => {
              handleSubmit(e);
            }}
          >
            Update Password
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChangePasswordModal;
