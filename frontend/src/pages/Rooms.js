import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rooms');
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Available Rooms</h2>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-5">
          <p>No rooms available.</p>
        </div>
      ) : (
        <Row>
          {rooms.map((room) => (
            <Col md={4} className="mb-4" key={room._id}>
              <Card className="h-100">
                <Card.Img variant="top" src={room.images[0]} alt={room.title} style={{ height: '200px', objectFit: 'cover' }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{room.title}</Card.Title>
                  <Card.Text>{room.description.slice(0, 80)}...</Card.Text>
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-1">{room.type}</Badge>
                    <Badge bg="info" className="me-1">Floor {room.floor}</Badge>
                  </div>
                  <div className="mb-2">
                    <span className="fw-bold text-primary">${room.price}/night</span>
                    <span className="text-muted ms-3">
                      <FaUsers className="me-1" />
                      {room.capacity} guests
                    </span>
                  </div>
                  <div className="mt-auto">
                    <Button as={Link} to={`/rooms/${room._id}`} variant="primary" className="w-100">
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
  );
};

export default Rooms; 