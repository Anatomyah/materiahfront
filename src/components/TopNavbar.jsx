import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { logout } from "../client/user_client";
import { useContext } from "react";
import { AppContext } from "../App";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

function TopNavBar() {
  const { token, setToken, isSupplier, setIsSupplier, setRememberMe } =
    useContext(AppContext);
  const handleLogout = async () => {
    try {
      await logout(token);
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setIsSupplier(false);
    setToken("");
    setRememberMe(false);
    toast("See you soon!");
  };

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Materiah
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {isSupplier ? (
              <Nav.Link as={Link} to="/supplier_catalogue">
                Catalogue
              </Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/inventory">
                  Inventory
                </Nav.Link>
                <Nav.Link as={Link} to="/shop">
                  Shop
                </Nav.Link>
                <Nav.Link as={Link} to="/orders">
                  Orders
                </Nav.Link>
                <NavDropdown title="Database" id="collasible-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/suppliers">
                    Suppliers
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/manufacturers">
                    Manufacturers
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/account">
              Account
            </Nav.Link>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default TopNavBar;
