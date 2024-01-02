import React, { useContext } from "react";
import { AppContext } from "../../App";
import ChangePasswordModal from "../../components/User/ChangePasswordModal";
import EditSupplierAccountModal from "../../components/User/EditSupplierAccountModal";
import AccountModal from "../../components/User/AccountModal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./UserPageStyle.css";

/**
 * `Account` is a React component that renders the account details of the user logged in.
 * This includes personal details like 'username', 'name', 'email' and 'phone'.
 * If the logged in user is a supplier, it additionally renders the supplier details like 'name', 'quote email', 'office phone', and 'website'.
 * It also provides the facility to edit the account details and change the password via modals.
 * The layout has been implemented using the Bootstrap library.
 *
 * Uses the following components:
 * - `ChangePasswordModal` - Modal to facilitate password changes.
 * - `EditSupplierAccountModal` - Modal to facilitate editing of supplier account details.
 * - `AccountModal` - Modal to facilitate editing of user account details.
 *
 * Uses the following data from context:
 * - `userDetails` - The details of the logged in user or supplier.
 * - `isSupplier` - A boolean flag indicating whether the logged in user is a supplier.
 *
 * @returns A React Element displaying the user/supplier's account details.
 */
const Account = () => {
  // useContext hook retrieves user details and the role of a user (isSupplier)
  const { userDetails, isSupplier } = useContext(AppContext);

  return (
    <div className="background-image-user">
      {/* Background overlay styled with 'overlay-user' */}
      <div className="overlay-user"></div>

      {/* Main content container component with customized CSS and inline styles */}
      <Container
        className="p-3 bordered-shadow-container ms-3 mt-3 content-user bg-light"
        style={{ maxWidth: "50%", float: "left" }}
      >
        <h1>Account Details</h1>
        {/* Following rows display various user details within two columns: a label and a value */}
        {/* Username row */}
        <Row className="p-3">
          <Col>
            <h2>Username:</h2>
          </Col>
          <Col>
            <h2>{userDetails.username}</h2>
          </Col>
        </Row>

        {/* More fields here... */}

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
        {/* If the user is a supplier, additional supplier details are rendered */}
        {isSupplier && (
          <>
            {/* Supplier specific field rows here... */}
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

        {/* Edit Account and Change Password actions/buttons */}
        <Row className="p-2">
          <Col className="d-flex flex-row">
            <div className="me-3">
              {/* Depending on the user type (supplier or generic user), a unique modal is provided for account editing */}
              {isSupplier ? <EditSupplierAccountModal /> : <AccountModal />}
            </div>

            {/* Change Password button which triggers a modal */}
            <div>
              <ChangePasswordModal
                userEmail={userDetails.email}
                buttonText="Change Password"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
export default Account;
