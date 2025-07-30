import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Spinner, Alert, Modal, Form, Pagination 
} from 'react-bootstrap';
import { FaCalendarAlt, FaUsers, FaDollarSign, FaTimes, FaEye } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings?page=${currentPage}&limit=10`);
      setBookings(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelLoading(true);
    try {
      await api.delete(`/bookings/${selectedBooking._id}`);
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel booking';
      toast.error(message);
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'warning', text: 'dark' },
      'Approved': { bg: 'success', text: 'white' },
      'Rejected': { bg: 'danger', text: 'white' },
      'Cancelled': { bg: 'secondary', text: 'white' }
    };

    const config = statusConfig[status] || { bg: 'light', text: 'dark' };
    return <Badge bg={config.bg} text={config.text}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canCancelBooking = (booking) => {
    const today = new Date();
    const checkInDate = new Date(booking.checkIn);
    return booking.status === 'Pending' || booking.status === 'Approved' && checkInDate > today;
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
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">My Dashboard</h1>
          <p className="text-muted">
            Welcome back, {user?.name}! Manage your bookings and view your stay history.
          </p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="dashboard-card text-center">
            <Card.Body>
              <FaCalendarAlt className="text-primary mb-2" size={24} />
              <h4>{bookings.length}</h4>
              <p className="text-muted mb-0">Total Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="dashboard-card text-center">
            <Card.Body>
              <Badge bg="warning" text="dark" className="mb-2">
                Pending
              </Badge>
              <h4>
                {bookings.filter(b => b.status === 'Pending').length}
              </h4>
              <p className="text-muted mb-0">Pending Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="dashboard-card text-center">
            <Card.Body>
              <Badge bg="success" className="mb-2">
                Approved
              </Badge>
              <h4>
                {bookings.filter(b => b.status === 'Approved').length}
              </h4>
              <p className="text-muted mb-0">Approved Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="dashboard-card text-center">
            <Card.Body>
              <FaDollarSign className="text-success mb-2" size={24} />
              <h4>
                ${bookings
                  .filter(b => b.status === 'Approved')
                  .reduce((sum, b) => sum + b.totalAmount, 0)
                  .toFixed(2)}
              </h4>
              <p className="text-muted mb-0">Total Spent</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bookings List */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">My Bookings</h5>
        </Card.Header>
        <Card.Body>
          {bookings.length === 0 ? (
            <Alert variant="info">
              <p className="mb-0">You haven't made any bookings yet.</p>
              <Button variant="primary" href="/" className="mt-2">
                Browse Rooms
              </Button>
            </Alert>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Guests</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <div>
                          <strong>{booking.room.title}</strong>
                          <br />
                          <small className="text-muted">
                            Room {booking.room.roomNumber}
                          </small>
                        </div>
                      </td>
                      <td>{formatDate(booking.checkIn)}</td>
                      <td>{formatDate(booking.checkOut)}</td>
                      <td>
                        <FaUsers className="me-1" />
                        {booking.guests}
                      </td>
                      <td>
                        <strong>${booking.totalAmount}</strong>
                      </td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowCancelModal(true);
                            }}
                            disabled={!canCancelBooking(booking)}
                          >
                            <FaTimes className="me-1" />
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Cancel Booking Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div>
              <p>Are you sure you want to cancel your booking for:</p>
              <div className="bg-light p-3 rounded">
                <strong>{selectedBooking.room.title}</strong>
                <br />
                <small className="text-muted">
                  {formatDate(selectedBooking.checkIn)} - {formatDate(selectedBooking.checkOut)}
                </small>
              </div>
              <Alert variant="warning" className="mt-3">
                <strong>Note:</strong> Cancellation is only possible before the check-in date.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Booking
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelBooking}
            disabled={cancelLoading}
          >
            {cancelLoading ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserDashboard; 