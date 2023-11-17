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
import { smallLogo } from "../../config_and_helpers/config";

function TopNavBar() {
  const { token, setToken, isSupplier, setIsSupplier, setRememberMe } =
    useContext(AppContext);
  const { setShowCart } = useContext(CartAppContext);
  const handleLogout = async () => {
    try {
      await logout(token);
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setIsSupplier(false);
    setToken(null);
    setRememberMe(false);
    toast("See you soon!");
  };

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-secondary">
      <Container>
        <Row className="w-100">
          <Col xs="auto">
            <Navbar.Brand as={Link} to="/">
              <img
                src={smallLogo}
                width="35"
                height="35"
                className="mb-2 me-2"
                alt="Materiah Logo"
              />
              Materiah
            </Navbar.Brand>
          </Col>
          <Col className="d-flex justify-content-end">
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
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
                    <NavDropdown title="Database" id="collasible-nav-dropdown">
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
              <Nav>
                <Nav.Link as={Link} to="/account">
                  Account
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Col>
        </Row>
      </Container>
    </Navbar>
    //   <Container>
    //     <Row>
    //       <Col>
    //         <Navbar.Brand as={Link} to="/">
    //           <img
    //             src={smallLogo}
    //             width="40" // Set the width of your logo
    //             height="40" // Set the height of your logo
    //             className="d-inline-block align-top" // This class aligns the image vertically with adjacent text
    //             alt="Materiah Logo" // Alt text for the logo
    //           />
    //           Materiah
    //         </Navbar.Brand>
    //       </Col>
    //       <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    //       <Navbar.Collapse id="responsive-navbar-nav">
    //         <Nav className="me-auto">
    //           {isSupplier ? (
    //             <>
    //               <Nav.Link as={Link} to="/supplier-catalogue">
    //                 Catalogue
    //               </Nav.Link>
    //             </>
    //           ) : (
    //             <>
    //               <Nav.Link as={Link} to="/inventory">
    //                 Inventory
    //               </Nav.Link>
    //               <Nav.Link as={Link} to="/orders">
    //                 Orders
    //               </Nav.Link>
    //               <NavDropdown title="Database" id="collasible-nav-dropdown">
    //                 <NavDropdown.Item as={Link} to="/suppliers">
    //                   Suppliers
    //                 </NavDropdown.Item>
    //                 <NavDropdown.Item as={Link} to="/manufacturers">
    //                   Manufacturers
    //                 </NavDropdown.Item>
    //                 <NavDropdown.Item as={Link} to="/quotes">
    //                   Quotes
    //                 </NavDropdown.Item>
    //               </NavDropdown>
    //               <Nav.Link as={Link} to="/shop">
    //                 Shop
    //               </Nav.Link>
    //               <Nav.Link onClick={() => setShowCart(true)}>
    //                 <ShoppingCartIcon />
    //               </Nav.Link>
    //             </>
    //           )}
    //         </Nav>
    //         <Nav>
    //           <Nav.Link as={Link} to="/account">
    //             Account
    //           </Nav.Link>
    //           <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
    //         </Nav>
    //       </Navbar.Collapse>
    //     </Row>
    //   </Container>
    // </Navbar>
  );
}

export default TopNavBar;
