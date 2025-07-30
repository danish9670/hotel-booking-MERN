import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { FaHotel, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);




  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <Navbar 
      expand="lg" 
      className="navbar-custom py-3"
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary-custom">
          <FaHotel className="me-2" />
          Hotel Booking
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              onClick={handleNavClick}
              className={location.pathname === '/' ? 'active fw-bold' : ''}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/rooms" 
              onClick={handleNavClick}
              className={location.pathname.startsWith('/rooms') ? 'active fw-bold' : ''}
            >
              Rooms
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/contact" 
              onClick={handleNavClick}
              className={location.pathname === '/contact' ? 'active fw-bold' : ''}
            >
              Contact
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/about" 
              onClick={handleNavClick}
              className={location.pathname === '/about' ? 'active fw-bold' : ''}
            >
              About Us
            </Nav.Link>
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' ? (
                  <Nav.Link 
                    as={Link} 
                    to="/admin/dashboard" 
                    onClick={handleNavClick}
                    className="btn btn-outline-primary me-2"
                  >
                    <FaCog className="me-1" />
                    Admin Dashboard
                  </Nav.Link>
                ) : (
                  <Nav.Link 
                    as={Link} 
                    to="/dashboard" 
                    onClick={handleNavClick}
                    className="btn btn-outline-primary me-2"
                  >
                    <FaUser className="me-1" />
                    My Dashboard
                  </Nav.Link>
                )}
                
                <NavDropdown 
                  title={
                    <span>
                      <FaUser className="me-1" />
                      {user?.name}
                    </span>
                  } 
                  id="basic-nav-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile" onClick={handleNavClick}>
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-1" />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  onClick={handleNavClick}
                  className="btn btn-outline-primary me-2"
                >
                  Login
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/register" 
                  onClick={handleNavClick}
                  className="btn btn-primary"
                >
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 