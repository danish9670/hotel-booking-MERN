import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaHotel, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="mb-3">
              <FaHotel className="me-2" />
              Hotel Booking
            </h5>
            <p className="text-muted">
              Experience luxury and comfort with our premium hotel booking service. 
              We provide the best accommodations for your perfect stay.
            </p>
          </Col>
          
          <Col md={4} className="mb-4">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-muted text-decoration-none">Home</a></li>
              <li><a href="/rooms" className="text-muted text-decoration-none">Rooms</a></li>
              <li><a href="/about" className="text-muted text-decoration-none">About Us</a></li>
              <li><a href="/contact" className="text-muted text-decoration-none">Contact</a></li>
            </ul>
          </Col>
          
          <Col md={4} className="mb-4">
            <h5 className="mb-3">Contact Info</h5>
            <div className="text-muted">
              <p className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                123 Hotel Street,Lucknow, India
              </p>
              <p className="mb-2">
                <FaPhone className="me-2" />
                +91 9876543210.
              </p>
              <p className="mb-2">
                <FaEnvelope className="me-2" />
                info@hotelbooking.com
              </p>
            </div>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row>
          <Col className="text-center">
            <p className="text-muted mb-0">
              © {new Date().getFullYear()} Hotel Booking Management System. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 