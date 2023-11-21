import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Navbar from "react-bootstrap/Navbar";

import "./NavBarStyle.css";

function BottomNavBar() {
  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      className="bg-custom-bottom"
      fixed="bottom"
    >
      <Container>
        <Row className="align-middle">
          <p>© 2023 Materiah</p>
        </Row>
      </Container>
    </Navbar>
  );
}

export default BottomNavBar;
