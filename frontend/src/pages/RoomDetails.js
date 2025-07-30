import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, Form, Badge, 
  Spinner, Modal, Alert, Carousel 
} from 'react-bootstrap';
import { FaUsers, FaBed, FaCalendarAlt, FaDollarSign, FaCheck } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    checkIn: null,
    checkOut: null,
    guests: 1,
    specialRequests: ''
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rooms/${id}`);
      setRoom(response.data.data);
    } catch (error) {
      console.error('Error fetching room details:', error);
      toast.error('Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to book a room');
      navigate('/login');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (bookingData.checkOut <= bookingData.checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setBookingLoading(true);
    
    try {
      const response = await api.post('/bookings', {
        roomId: room._id,
        checkIn: bookingData.checkIn.toISOString(),
        checkOut: bookingData.checkOut.toISOString(),
        guests: bookingData.guests,
        specialRequests: bookingData.specialRequests
      });

      toast.success('Booking request submitted successfully!');
      setShowBookingModal(false);
      setBookingData({
        checkIn: null,
        checkOut: null,
        guests: 1,
        specialRequests: ''
      });
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit booking';
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusBadge = (isAvailable) => {
    return isAvailable ? (
      <Badge bg="success">Available</Badge>
    ) : (
      <Badge bg="danger">Unavailable</Badge>
    );
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((bookingData.checkOut - bookingData.checkIn) / oneDay));
  };

  const calculateTotal = () => {
    if (!room) return 0;
    return room.price * calculateNights();
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

  if (!room) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Room not found or has been removed.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          {/* Room Images Carousel */}
          <Card className="mb-4">
            <Carousel>
              {room.images.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100 room-detail-image"
                    src={image}
                    alt={`${room.title} - Image ${index + 1}`}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </Card>

          {/* Room Details */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-2">{room.title}</h2>
                  <div className="mb-3">
                    {getStatusBadge(room.isAvailable)}
                    <Badge bg="secondary" className="ms-2">
                      {room.type}
                    </Badge>
                    <Badge bg="info" className="ms-2">
                      Floor {room.floor}
                    </Badge>
                  </div>
                </div>
                <div className="text-end">
                  <h3 className="text-primary mb-0">${room.price}</h3>
                  <small className="text-muted">per night</small>
                </div>
              </div>

              <p className="text-muted mb-4">{room.description}</p>

              <Row className="mb-4">
                <Col md={6}>
                  <div className="d-flex align-items-center mb-2">
                    <FaUsers className="text-primary me-2" />
                    <span>Capacity: {room.capacity} guests</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaBed className="text-primary me-2" />
                    <span>Room Number: {room.roomNumber}</span>
                  </div>
                </Col>
              </Row>

              <h5>Amenities</h5>
              <div className="mb-4">
                {room.amenities.map((amenity, index) => (
                  <Badge key={index} bg="light" text="dark" className="me-2 mb-2">
                    <FaCheck className="me-1" />
                    {amenity}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Booking Card */}
          <Card className="sticky-top" style={{ top: '2rem' }}>
            <Card.Body>
              <h4 className="mb-3">Book This Room</h4>
              
              <div className="mb-3">
                <strong>Price:</strong> ${room.price} per night
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={() => setShowBookingModal(true)}
                disabled={!room.isAvailable}
              >
                {room.isAvailable ? 'Book Now' : 'Not Available'}
              </Button>

              {!room.isAvailable && (
                <Alert variant="warning" className="mt-3">
                  This room is currently unavailable for booking.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Book {room.title}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBookingSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Check-in Date</Form.Label>
                  <DatePicker
                    selected={bookingData.checkIn}
                    onChange={(date) => setBookingData(prev => ({ ...prev, checkIn: date }))}
                    minDate={new Date()}
                    className="form-control"
                    placeholderText="Select check-in date"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Check-out Date</Form.Label>
                  <DatePicker
                    selected={bookingData.checkOut}
                    onChange={(date) => setBookingData(prev => ({ ...prev, checkOut: date }))}
                    minDate={bookingData.checkIn || new Date()}
                    className="form-control"
                    placeholderText="Select check-out date"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Guests</Form.Label>
                  <Form.Select
                    value={bookingData.guests}
                    onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nights</Form.Label>
                  <Form.Control
                    type="text"
                    value={calculateNights()}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Special Requests (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Any special requests or requirements..."
              />
            </Form.Group>

            <Card className="bg-light">
              <Card.Body>
                <h6>Booking Summary</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Price per night:</span>
                  <span>${room.price}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Number of nights:</span>
                  <span>{calculateNights()}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total Amount:</span>
                  <span>${calculateTotal()}</span>
                </div>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Submitting...' : 'Confirm Booking'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default RoomDetails; 