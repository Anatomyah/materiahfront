import React, { useContext } from "react";
import { AppContext } from "../../App";
import ChangePasswordModal from "../../components/User/ChangePasswordModal";
import EditSupplierAccountModal from "../../components/User/EditSupplierAccountModal";
import AccountModal from "../../components/User/AccountModal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const Account = () => {
  const { userDetails, isSupplier } = useContext(AppContext);

  return (
    <Container className="p-3" style={{ maxWidth: "50%", float: "left" }}>
      <h1>Account Details</h1>
      <Row className="p-3">
        <Col>
          <h2>Username:</h2>
        </Col>
        <Col>
          <h2>{userDetails.username}</h2>
        </Col>
      </Row>
      <Row className="p-3">
        <Col>
          <h3>Name:</h3>
        </Col>
        <Col>
          <h3>
            {userDetails.first_name} {userDetails.last_name}
          </h3>
        </Col>
      </Row>
      <Row className="p-3">
        <Col>
          <h3>Email:</h3>
        </Col>
        <Col>
          <h3>{userDetails.email}</h3>
        </Col>
      </Row>
      <Row className="p-3">
        <Col>
          <h3>Phone:</h3>
        </Col>
        <Col>
          <h3>
            {userDetails.phone_prefix}-{userDetails.phone_suffix}
          </h3>
        </Col>
      </Row>
      {isSupplier && (
        <>
          <Row className="p-2">
            <Col>
              <h1>Supplier Details:</h1>
            </Col>
          </Row>
          <Row className="p-2">
            <Col>
              <h2>Name:</h2>
            </Col>
            <Col>
              <h2>{userDetails.supplier_name}</h2>
            </Col>
          </Row>
          <Row className="p-2">
            <Col>
              <h3>Quote Email:</h3>
            </Col>
            <Col>
              <h3>{userDetails.supplier_email}</h3>
            </Col>
          </Row>
          <Row className="p-2">
            <Col>
              <h3>Office Phone:</h3>
            </Col>
            <Col>
              <h3>
                {userDetails.supplier_phone_prefix}-
                {userDetails.supplier_phone_suffix}
              </h3>
            </Col>
          </Row>
          <Row className="p-2">
            <Col>
              <h3>Website:</h3>
            </Col>
            <Col>
              <h3>{userDetails.supplier_website}</h3>
            </Col>
          </Row>
        </>
      )}
      <Row className="p-2">
        <Col className="d-flex flex-row">
          <div className="me-3">
            {isSupplier ? <EditSupplierAccountModal /> : <AccountModal />}
          </div>
          <div>
            <ChangePasswordModal
              userEmail={userDetails.email}
              buttonText="Change Password"
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};
export default Account;
