import { ReactNode } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';

type Props = { children: ReactNode };

export default function AppLayout({ children }: Props) {
  return (
    <>
      <Navbar expand="lg" variant="dark" className="mb-3" style={{background:'transparent'}}>
        <Container>
          <Navbar.Brand href="/app" className="d-flex align-items-center gap-2">
            <i className="bi bi-magic"></i>
            <span style={{fontFamily:'Playfair Display', fontWeight:600, letterSpacing:.3}}>
              AILearn
            </span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="nav" />
          <Navbar.Collapse id="nav">
            <Nav className="ms-auto">
              <Nav.Link href="/app" className="d-flex align-items-center gap-1">
                <i className="bi bi-grid-1x2"></i> לוח בקרה
              </Nav.Link>
              <Nav.Link href="/auth" className="d-flex align-items-center gap-1">
                <i className="bi bi-box-arrow-right"></i> יציאה
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main>{children}</main>
    </>
  );
}
