// web/src/components/AppNavbar.tsx
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, clearUser } from '../lib/auth';
import { BRAND_NAME } from '../config/brand';

export default function AppNavbar() {
  const me = getUser();
  const navigate = useNavigate();

  return (
    <Navbar
      expand="md"
      className="navbar-elevated navbar-colored-dark navbar-animated"
      variant="dark"
      sticky="top"
      role="navigation"
      aria-label="Main"
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to={me ? '/app' : '/auth'}
          className="fw-bold"
        >
          {BRAND_NAME}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-center">
            {!me && (
              <Nav.Link as={Link} to="/auth">
                Sign In
              </Nav.Link>
            )}

            {me && (
              <Button
                size="sm"
                variant="outline-light"
                onClick={() => {
                  clearUser();
                  navigate('/auth');
                }}
              >
                Sign Out
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}


