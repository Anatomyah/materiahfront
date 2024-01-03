import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { logout } from "../../clients/user_client";
import { useContext } from "react";
import { AppContext, CartAppContext } from "../../App";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import "./NavBarStyle.css";

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
  const { token, setToken, isSupplier, setIsSupplier, setRememberMe } =
    useContext(AppContext);
  const { setShowCart } = useContext(CartAppContext);

  // Function to logout user
  const handleLogout = () => {
    logout(token) // Call to logout client function which makes actual API request
      .then((response) => {
        if (response && response.success) {
          setIsSupplier(false);
          setToken(null);
          setRememberMe(false);
          toast("See you soon!"); // Gives feedback that logout was a success
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
                className="d-inline-block align-top"
              />{" "}
              Materiah
            </Navbar.Brand>
          </Col>
          <Col className="d-flex justify-content-end">
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              {/* Link elements for navigation - these will change depending if user is a supplier or not */}
              <Nav className="me-auto">
                {isSupplier ? (
                  <>
                    <Nav.Link as={Link} to="/supplier-catalogue">
                      Catalogue
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/inventory">
                      Inventory
                    </Nav.Link>
                    <Nav.Link as={Link} to="/orders">
                      Orders
                    </Nav.Link>
                    <NavDropdown title="Database" id="collapsible-nav-dropdown">
                      <NavDropdown.Item as={Link} to="/suppliers">
                        Suppliers
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/manufacturers">
                        Manufacturers
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/quotes">
                        Quotes
                      </NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link as={Link} to="/shop">
                      Shop
                    </Nav.Link>
                    <Nav.Link onClick={() => setShowCart(true)}>
                      <ShoppingCartIcon />
                    </Nav.Link>
                  </>
                )}
              </Nav>

              {/* User Account options */}
              <NavDropdown
                title={<AccountCircleIcon style={{ fontSize: "24px" }} />}
                id="collapsible-nav-dropdown"
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
