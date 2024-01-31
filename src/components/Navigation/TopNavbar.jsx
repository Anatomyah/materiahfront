import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { logout } from "../../clients/user_client";
import { useContext, Fragment } from "react";
import { AppContext, CartAppContext } from "../../App";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./NavBarStyle.css";
import { showToast } from "../../config_and_helpers/helpers";
import {
  Boxes,
  Clipboard2,
  Shop,
  HouseDoor,
  Bell,
  PieChart,
  Cart3,
  PersonCircle,
} from "react-bootstrap-icons";

/**
 * TopNavBar Component
 *
 * This component represents a top navigation bar, providing links to different
 * parts of the application depending on user's role. Also includes logout functionality.
 *
 * @component
 *
 * @example
 *
 * return (
 *   <TopNavBar />
 * );
 */
function TopNavBar() {
  // Hooks from AppContext and CartAppContext used to access and update context data
  const {
    token,
    setToken,
    isSupplier,
    setIsSupplier,
    setRememberMe,
    setNotificationsSeen,
  } = useContext(AppContext);
  const { setShowCart } = useContext(CartAppContext);

  // Function to logout user
  const handleLogout = () => {
    logout(token) // Call to logout client function which makes actual API request
      .then((response) => {
        if (response && response.success) {
          setIsSupplier(false);
          setToken(null);
          setRememberMe(false);
          showToast("See you soon!", "success", "top-right", 3000); // Gives feedback that logout was a success
          setNotificationsSeen(false);
        }
      });
  };

  return (
    // Bootstrap Navbar component with custom styles
    <Navbar collapseOnSelect expand="lg" className="bg-custom navbar-content">
      <Container>
        <Row className="w-100 align-items-center">
          <Col xs="auto">
            {/*Navbar brand logo and text*/}
            <Navbar.Brand as={Link} to="/">
              <img
                alt=""
                src="https://materiah1.s3.eu-central-1.amazonaws.com/design/chemistry+(1).png"
                width="30"
                height="30"
                className="d-inline-block align-baseline"
              />{" "}
              <span style={{ fontSize: "28px" }}>Materiah</span>
            </Navbar.Brand>
          </Col>
          <Col className="me-auto">
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              {/* Link elements for navigation - these will change depending upon if user is a supplier or not */}

              {isSupplier ? (
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/supplier-catalogue">
                    Catalogue
                  </Nav.Link>
                </Nav>
              ) : (
                <>
                  <Nav className="me-auto">
                    <Nav.Link as={Link} to="/inventory">
                      <Boxes className="mb-1" style={{ fontSize: "18x" }} />{" "}
                      <span style={{ fontSize: "18px" }}>Inventory</span>
                    </Nav.Link>
                    <NavDropdown
                      title={
                        <>
                          <Clipboard2
                            className="mb-1"
                            style={{ fontSize: "18px" }}
                          />{" "}
                          <span style={{ fontSize: "18px" }}>Procure</span>
                        </>
                      }
                    >
                      <NavDropdown.Item as={Link} to="/orders">
                        Orders
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/quotes">
                        Quotes
                      </NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown
                      title={
                        <>
                          <HouseDoor
                            className="mb-1"
                            style={{ fontSize: "18px" }}
                          />{" "}
                          <span style={{ fontSize: "18px" }}>Sources</span>
                        </>
                      }
                    >
                      <NavDropdown.Item as={Link} to="/suppliers">
                        Suppliers
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/manufacturers">
                        Manufacturers
                      </NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown
                      title={
                        <>
                          <PieChart
                            className="mb-1"
                            style={{ fontSize: "18px" }}
                          />{" "}
                          <span style={{ fontSize: "18px" }}>Lab Data</span>
                        </>
                      }
                      id="collapsible-nav-dropdown"
                    >
                      <NavDropdown.Item as={Link} to="/suppliers" disabled>
                        Coming Soon!
                      </NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link as={Link} to="/notifications">
                      <Bell className="mb-1" style={{ fontSize: "18px" }} />{" "}
                      <span style={{ fontSize: "18px" }}>Notifications</span>
                    </Nav.Link>
                  </Nav>
                  <Nav className="mx-auto">
                    <Nav.Link as={Link} to="/shop">
                      <Shop className="mb-1" style={{ fontSize: "18px" }} />{" "}
                      <span style={{ fontSize: "18px" }}>Shop</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => setShowCart(true)}>
                      <Cart3 className="mb-1" style={{ fontSize: "18px" }} />{" "}
                      <span style={{ fontSize: "18px" }}>Cart</span>
                    </Nav.Link>
                  </Nav>
                </>
              )}

              {/* User Account options */}
              <NavDropdown
                title={<PersonCircle style={{ fontSize: "22px" }} />}
                id="collapsible-nav-dropdown"
                className="ms-auto"
              >
                <NavDropdown.Item as={Link} to="/account">
                  Account
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Navbar.Collapse>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
}

export default TopNavBar;
