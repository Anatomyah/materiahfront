import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Navbar from "react-bootstrap/Navbar";
import "./NavBarStyle.css";

/**
 * BottomNavBar Component
 *
 * This component is a simple navigation bar that is primarily used as a footer.
 * A copyright statement is displayed, positioned at the bottom of the browser window.
 *
 * @component
 *
 * @example
 *
 * return (
 *   <BottomNavBar />
 * );
 */
function BottomNavBar() {
  return (
    // Bootstrap Navbar component, that remains fixed at the bottom of the page (fixed="bottom")
    <Navbar
      collapseOnSelect
      expand="lg"
      className="bg-custom-bottom"
      fixed="bottom" // Fixed position at the bottom of the page
    >
      <Container>
        {" "}
        // Bootstrap Container component serves as a responsive wrapper
        <Row className="align-middle">
          {" "}
          // Bootstrap Row for grid-like layout
          <p>© 2023 Materiah</p> // Copyright text
        </Row>
      </Container>
    </Navbar>
  );
}
export default BottomNavBar;
