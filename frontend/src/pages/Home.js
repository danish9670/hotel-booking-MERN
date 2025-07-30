import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaUsers, FaBed } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    available: true
  });

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.available) params.append('available', 'true');
      
      const response = await api.get(`/rooms?${params}`);
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      available: true
    });
  };

  const getStatusBadge = (isAvailable) => {
    return isAvailable ? (
      <Badge bg="success">Available</Badge>
    ) : (
      <Badge bg="danger">Unavailable</Badge>
    );
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Welcome to Hotel Booking
              </h1>
              <p className="lead mb-4">
                Discover luxury accommodations and exceptional service. 
                Book your perfect stay with us today.
              </p>
              <Button 
                as={Link} 
                to="/rooms" 
                size="lg" 
                variant="light"
                className="me-3"
              >
                View All Rooms
              </Button>
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600" 
                  alt="Luxury Hotel" 
                  className="img-fluid rounded"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Filters Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="form-container">
                <Card.Body>
                  <h4 className="mb-4">
                    <FaSearch className="me-2" />
                    Find Your Perfect Room
                  </h4>
                  <Row>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Room Type</Form.Label>
                        <Form.Select 
                          name="type" 
                          value={filters.type}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Types</option>
                          <option value="Single">Single</option>
                          <option value="Double">Double</option>
                          <option value="Suite">Suite</option>
                          <option value="Deluxe">Deluxe</option>
                          <option value="Presidential">Presidential</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Min Price</Form.Label>
                        <Form.Control
                          type="number"
                          name="minPrice"
                          value={filters.minPrice}
                          onChange={handleFilterChange}
                          placeholder="Min Price"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Max Price</Form.Label>
                        <Form.Control
                          type="number"
                          name="maxPrice"
                          value={filters.maxPrice}
                          onChange={handleFilterChange}
                          placeholder="Max Price"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3 d-flex align-items-end">
                      <Button 
                        variant="outline-secondary" 
                        onClick={clearFilters}
                        className="w-100"
                      >
                        Clear Filters
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Rooms Section */}
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2 className="text-center mb-3">Available Rooms</h2>
              <p className="text-center text-muted">
                Choose from our selection of premium accommodations
              </p>
            </Col>
          </Row>

          {rooms.length === 0 ? (
            <Row>
              <Col className="text-center">
                <p className="text-muted">No rooms available with the current filters.</p>
                <Button variant="outline-primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Col>
            </Row>
          ) : (
            <Row>
              {rooms.map((room) => (
                <Col key={room._id} lg={4} md={6} className="mb-4">
                  <Card className="room-card h-100">
                    <div className="position-relative">
                      <Card.Img 
                        variant="top" 
                        src={room.images[0]} 
                        className="room-image"
                        alt={room.title}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        {getStatusBadge(room.isAvailable)}
                      </div>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h5">{room.title}</Card.Title>
                      <Card.Text className="text-muted small mb-2">
                        {room.description.substring(0, 100)}...
                      </Card.Text>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-primary">${room.price}/night</span>
                          <span className="text-muted">
                            <FaUsers className="me-1" />
                            {room.capacity} guests
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <Badge bg="secondary" className="me-1">
                            {room.type}
                          </Badge>
                          <Badge bg="info" className="me-1">
                            Floor {room.floor}
                          </Badge>
                        </div>
                        
                        <div className="small text-muted">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="me-2">
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="text-muted">+{room.amenities.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <Button 
                          as={Link} 
                          to={`/rooms/${room._id}`}
                          variant="primary" 
                          className="w-100"
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </div>
  );
};

export default Home; 